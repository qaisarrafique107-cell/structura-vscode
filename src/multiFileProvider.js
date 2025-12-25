"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiFileProvider = exports.MultiFileItem = void 0;
const vscode = require("vscode");
const codeMover_1 = require("./codeMover");
const symbolCache_1 = require("./symbolCache");
/**
 * Enhanced TreeItem that can represent both files and symbols
 */
class MultiFileItem extends vscode.TreeItem {
    constructor(label, collapsibleState, itemType, document, symbol, children = []) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.itemType = itemType;
        this.document = document;
        this.symbol = symbol;
        this.children = children;
        if (itemType === 'file') {
            this.iconPath = new vscode.ThemeIcon('file-code');
            this.contextValue = 'file';
            this.description = document ? vscode.workspace.asRelativePath(document.uri) : '';
        }
        else {
            this.iconPath = symbol ? new vscode.ThemeIcon(this.getSymbolIcon(symbol.kind)) : undefined;
            this.contextValue = 'symbol';
            this.description = symbol ? vscode.SymbolKind[symbol.kind] : '';
        }
    }
    getSymbolIcon(kind) {
        switch (kind) {
            case vscode.SymbolKind.Function: return 'symbol-function';
            case vscode.SymbolKind.Class: return 'symbol-class';
            case vscode.SymbolKind.Method: return 'symbol-method';
            case vscode.SymbolKind.Property: return 'symbol-property';
            case vscode.SymbolKind.Variable: return 'symbol-variable';
            case vscode.SymbolKind.Constant: return 'symbol-constant';
            default: return 'symbol-misc';
        }
    }
}
exports.MultiFileItem = MultiFileItem;
/**
 * Multi-file TreeView provider with cross-file drag-drop support
 */
class MultiFileProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.dragMimeTypes = ['application/vnd.code.tree.multifileitem'];
        this.dropMimeTypes = ['application/vnd.code.tree.multifileitem'];
        this.trackedDocuments = new Map();
        this.codeMover = new codeMover_1.CodeMover();
        this.symbolCache = symbolCache_1.SymbolCache.getInstance();
        this.initializeTracking();
    }
    initializeTracking() {
        // Track all open text documents
        vscode.workspace.textDocuments.forEach(doc => {
            if (this.isCodeFile(doc)) {
                this.trackedDocuments.set(doc.uri.fsPath, doc);
            }
        });
        // Listen for document opens
        vscode.workspace.onDidOpenTextDocument(doc => {
            if (this.isCodeFile(doc)) {
                this.trackedDocuments.set(doc.uri.fsPath, doc);
                this.refresh();
            }
        });
        // Listen for document closes
        vscode.workspace.onDidCloseTextDocument(doc => {
            this.trackedDocuments.delete(doc.uri.fsPath);
            this.refresh();
        });
    }
    isCodeFile(doc) {
        var _a;
        const ext = (_a = doc.fileName.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        return ['ts', 'js', 'tsx', 'jsx', 'py', 'java', 'cs', 'cpp', 'go', 'rs', 'php', 'rb'].includes(ext || '');
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!element) {
                // Root level: show all tracked files
                const fileItems = [];
                // Check cache first for each document
                for (const doc of this.trackedDocuments.values()) {
                    const cachedSymbols = this.symbolCache.get(doc.uri, doc.version);
                    if (cachedSymbols) {
                        // Use cached symbols if available
                        const symbolItems = cachedSymbols.map(symbol => new MultiFileItem(symbol.name, vscode.TreeItemCollapsibleState.None, 'symbol', doc, symbol));
                        if (symbolItems.length > 0) {
                            fileItems.push(new MultiFileItem(doc.fileName.split('/').pop() || 'Untitled', vscode.TreeItemCollapsibleState.Collapsed, 'file', doc, undefined, symbolItems));
                        }
                    }
                    else {
                        // Otherwise, parse the document
                        const symbols = yield vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', doc.uri);
                        if (symbols && symbols.length > 0) {
                            // Cache the parsed symbols
                            this.symbolCache.set(doc.uri, doc.version, symbols);
                            const symbolItems = symbols.map(symbol => new MultiFileItem(symbol.name, vscode.TreeItemCollapsibleState.None, 'symbol', doc, symbol));
                            fileItems.push(new MultiFileItem(doc.fileName.split('/').pop() || 'Untitled', vscode.TreeItemCollapsibleState.Collapsed, 'file', doc, undefined, symbolItems));
                        }
                    }
                }
                for (const [path, doc] of this.trackedDocuments) {
                    const fileName = path.split(/[\\/]/).pop() || path;
                    fileItems.push(new MultiFileItem(fileName, vscode.TreeItemCollapsibleState.Collapsed, 'file', doc, undefined, []));
                }
                return fileItems.sort((a, b) => a.label.localeCompare(b.label));
            }
            if (element.itemType === 'file' && element.document) {
                // File level: show symbols
                const symbols = yield vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', element.document.uri);
                if (!symbols || symbols.length === 0) {
                    return [];
                }
                return this.mapSymbolsToItems(symbols, element.document);
            }
            if (element.itemType === 'symbol' && element.children) {
                // Symbol level: show children
                return element.children;
            }
            return [];
        });
    }
    mapSymbolsToItems(symbols, document) {
        return symbols.map(symbol => {
            const children = this.mapSymbolsToItems(symbol.children, document);
            return new MultiFileItem(symbol.name, children.length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None, 'symbol', document, symbol, children);
        });
    }
    // Drag and Drop Implementation
    handleDrag(source, dataTransfer, token) {
        return __awaiter(this, void 0, void 0, function* () {
            // Handle both single and multi-item drag
            if (source && source.length > 0) {
                dataTransfer.set('application/vnd.code.tree.multifileitem', new vscode.DataTransferItem(source));
            }
            return Promise.resolve();
        });
    }
    handleDrop(target, dataTransfer, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const transferItem = dataTransfer.get('application/vnd.code.tree.multifileitem');
            if (!transferItem) {
                return;
            }
            const sourceItems = Array.isArray(transferItem.value)
                ? transferItem.value
                : [transferItem.value];
            if (sourceItems.length === 0) {
                return;
            }
            // Determine target document and position
            let targetDocument;
            let targetPosition;
            if (!target) {
                // Dropped on empty space - use active editor
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showWarningMessage('No target file selected');
                    return;
                }
                targetDocument = editor.document;
                targetPosition = new vscode.Position(targetDocument.lineCount, 0);
            }
            else if (target.itemType === 'file' && target.document) {
                // Dropped on a file - append to end
                targetDocument = target.document;
                targetPosition = new vscode.Position(targetDocument.lineCount, 0);
            }
            else if (target.itemType === 'symbol' && target.document && target.symbol) {
                // Dropped on a symbol - insert before that symbol
                targetDocument = target.document;
                targetPosition = target.symbol.range.start;
            }
            else {
                vscode.window.showWarningMessage('Invalid drop target');
                return;
            }
            if (!targetDocument || !targetPosition) {
                vscode.window.showWarningMessage('Could not determine drop target');
                return;
            }
            // Process each source item
            for (const sourceItem of sourceItems) {
                if (!sourceItem.document || !sourceItem.symbol) {
                    continue;
                }
                const isSameFile = sourceItem.document.uri.fsPath === targetDocument.uri.fsPath;
                if (isSameFile) {
                    // Same file: use simple move logic
                    yield this.moveSameFile(sourceItem, targetPosition);
                }
                else {
                    // Different file: use CodeMover for cross-file operation
                    yield this.moveCrossFile(sourceItem, targetDocument, targetPosition);
                }
                // Invalidate cache for affected files
                this.symbolCache.invalidate(sourceItem.document.uri);
                this.symbolCache.invalidate(targetDocument.uri);
            }
            this.refresh();
        });
    }
    moveSameFile(sourceItem, targetPosition) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!sourceItem.document || !sourceItem.symbol) {
                return;
            }
            const editor = yield vscode.window.showTextDocument(sourceItem.document);
            const sourceRange = sourceItem.symbol.range;
            const sourceText = sourceItem.document.getText(sourceRange).trim();
            const sourceStart = sourceRange.start;
            const sourceIsBeforeTarget = sourceStart.isBefore(targetPosition);
            yield editor.edit(editBuilder => {
                if (sourceIsBeforeTarget) {
                    editBuilder.delete(sourceRange);
                    const deletedLines = sourceRange.end.line - sourceRange.start.line + 1;
                    const adjustedTarget = targetPosition.translate(-deletedLines, 0);
                    editBuilder.insert(adjustedTarget, sourceText + '\n\n');
                }
                else {
                    editBuilder.insert(targetPosition, sourceText + '\n\n');
                    const insertedLines = sourceText.split('\n').length + 2;
                    const adjustedSource = new vscode.Range(sourceRange.start.translate(insertedLines, 0), sourceRange.end.translate(insertedLines, 0));
                    editBuilder.delete(adjustedSource);
                }
            });
            vscode.window.showInformationMessage('✅ Code moved successfully!');
        });
    }
    moveCrossFile(sourceItem, targetDocument, targetPosition) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!sourceItem.document || !sourceItem.symbol) {
                return;
            }
            try {
                const success = yield this.codeMover.moveSymbol(sourceItem.document, targetDocument, sourceItem.symbol, targetPosition);
                if (success) {
                    vscode.window.showInformationMessage(`✅ Moved ${sourceItem.symbol.name} to ${targetDocument.fileName.split(/[\\/]/).pop()}`);
                    // Open target file to show the result
                    yield vscode.window.showTextDocument(targetDocument);
                }
            }
            catch (error) {
                vscode.window.showErrorMessage(`❌ Failed to move code: ${error}`);
            }
        });
    }
    dispose() {
        // Cleanup if needed
    }
}
exports.MultiFileProvider = MultiFileProvider;
//# sourceMappingURL=multiFileProvider.js.map