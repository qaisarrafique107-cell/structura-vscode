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
exports.StructuraItem = exports.StructuraProvider = void 0;
const vscode = require("vscode");
class StructuraProvider {
    constructor() {
        // Event Emitter for refreshing the view
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        // Drag MIME type
        this.dragMimeTypes = ['application/vnd.code.tree.structuraItem'];
        this.dropMimeTypes = ['application/vnd.code.tree.structuraItem'];
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return [];
            }
            // If we are looking for children of a specific item (nested symbols), return them
            if (element) {
                return element.children;
            }
            // Otherwise, fetch root symbols from the document
            const symbols = yield vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', editor.document.uri);
            if (!symbols || symbols.length === 0) {
                return [];
            }
            return this.mapSymbolsToItems(symbols, editor.document);
        });
    }
    mapSymbolsToItems(symbols, document) {
        return symbols.map(symbol => {
            const children = this.mapSymbolsToItems(symbol.children, document);
            return new StructuraItem(symbol, children);
        });
    }
    // --- Drag and Drop Implementation ---
    handleDrag(source, dataTransfer, token) {
        if (source.length === 0) {
            return;
        }
        // Store the source item in the DataTransfer
        const item = source[0];
        dataTransfer.set('application/vnd.code.tree.structuraItem', new vscode.DataTransferItem(item));
    }
    handleDrop(target, dataTransfer, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const transferItem = dataTransfer.get('application/vnd.code.tree.structuraItem');
            if (!transferItem) {
                return;
            }
            const sourceItem = transferItem.value;
            const editor = vscode.window.activeTextEditor;
            if (!editor || !sourceItem || sourceItem === target) {
                return;
            }
            const sourceRange = sourceItem.symbol.range;
            const targetRange = target ? target.symbol.range : null;
            if (!targetRange) {
                return;
            }
            try {
                const document = editor.document;
                let sourceText = document.getText(sourceRange).trim();
                const targetLine = document.lineAt(targetRange.start.line);
                const needsSpacing = targetLine.text.trim().length > 0;
                sourceText = sourceText + (needsSpacing ? '\n\n' : '\n');
                const sourceStart = sourceRange.start;
                const targetStart = targetRange.start;
                const sourceIsBeforeTarget = sourceStart.isBefore(targetStart);
                // Use edit builder for sequential operations
                // Note: The User requested logic assumes edits are sequential or manually adjusted. 
                // The code below manually adjusts coordinates passed to the builder.
                yield editor.edit(editBuilder => {
                    if (sourceIsBeforeTarget) {
                        // Moving DOWN: Delete first, then insert
                        editBuilder.delete(sourceRange);
                        // After delete, target shifts UP by deleted line count
                        const deletedLines = sourceRange.end.line - sourceRange.start.line + 1;
                        const adjustedTarget = targetStart.translate(-deletedLines, 0);
                        editBuilder.insert(adjustedTarget, sourceText);
                    }
                    else {
                        // Moving UP: Insert first, then delete
                        editBuilder.insert(targetStart, sourceText);
                        // After insert, source shifts DOWN by inserted line count
                        const insertedLines = sourceText.split('\n').length - 1;
                        const adjustedSource = new vscode.Range(sourceRange.start.translate(insertedLines, 0), sourceRange.end.translate(insertedLines, 0));
                        editBuilder.delete(adjustedSource);
                    }
                });
                vscode.window.showInformationMessage('✅ Code moved successfully!');
                this.refresh();
            }
            catch (error) {
                vscode.window.showErrorMessage('❌ Failed to move code: ' + error);
                console.error('Structura error:', error);
            }
        });
    }
}
exports.StructuraProvider = StructuraProvider;
class StructuraItem extends vscode.TreeItem {
    constructor(symbol, children) {
        super(symbol.name, children.length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
        this.symbol = symbol;
        this.children = children;
        this.tooltip = `${symbol.name} (${vscode.SymbolKind[symbol.kind]})`;
        this.description = vscode.SymbolKind[symbol.kind];
        // Icons based on kind
        this.iconPath = new vscode.ThemeIcon(this.getIconId(symbol.kind));
    }
    getIconId(kind) {
        switch (kind) {
            case vscode.SymbolKind.File: return 'file';
            case vscode.SymbolKind.Module: return 'package';
            case vscode.SymbolKind.Namespace: return 'symbol-namespace';
            case vscode.SymbolKind.Package: return 'package';
            case vscode.SymbolKind.Class: return 'symbol-class';
            case vscode.SymbolKind.Method: return 'symbol-method';
            case vscode.SymbolKind.Property: return 'symbol-property';
            case vscode.SymbolKind.Field: return 'symbol-field';
            case vscode.SymbolKind.Constructor: return 'symbol-constructor';
            case vscode.SymbolKind.Enum: return 'symbol-enum';
            case vscode.SymbolKind.Interface: return 'symbol-interface';
            case vscode.SymbolKind.Function: return 'symbol-function';
            case vscode.SymbolKind.Variable: return 'symbol-variable';
            case vscode.SymbolKind.Constant: return 'symbol-constant';
            case vscode.SymbolKind.String: return 'symbol-string';
            case vscode.SymbolKind.Number: return 'symbol-number';
            case vscode.SymbolKind.Boolean: return 'symbol-boolean';
            case vscode.SymbolKind.Array: return 'symbol-array';
            default: return 'symbol-misc';
        }
    }
}
exports.StructuraItem = StructuraItem;
//# sourceMappingURL=structuraProvider.js.map