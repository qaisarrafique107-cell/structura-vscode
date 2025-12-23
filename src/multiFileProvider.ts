import * as vscode from 'vscode';
import { CodeMover } from './codeMover';
import { SymbolCache } from './symbolCache';

/**
 * Enhanced TreeItem that can represent both files and symbols
 */
export class MultiFileItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly itemType: 'file' | 'symbol',
        public readonly document?: vscode.TextDocument,
        public readonly symbol?: vscode.DocumentSymbol,
        public readonly children: MultiFileItem[] = []
    ) {
        super(label, collapsibleState);
        
        if (itemType === 'file') {
            this.iconPath = new vscode.ThemeIcon('file-code');
            this.contextValue = 'file';
            this.description = document ? vscode.workspace.asRelativePath(document.uri) : '';
        } else {
            this.iconPath = symbol ? new vscode.ThemeIcon(this.getSymbolIcon(symbol.kind)) : undefined;
            this.contextValue = 'symbol';
            this.description = symbol ? vscode.SymbolKind[symbol.kind] : '';
        }
    }

    private getSymbolIcon(kind: vscode.SymbolKind): string {
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

/**
 * Multi-file TreeView provider with cross-file drag-drop support
 */
export class MultiFileProvider implements vscode.TreeDataProvider<MultiFileItem>, vscode.TreeDragAndDropController<MultiFileItem> {
    
    private _onDidChangeTreeData: vscode.EventEmitter<MultiFileItem | undefined | null | void> = new vscode.EventEmitter<MultiFileItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<MultiFileItem | undefined | null | void> = this._onDidChangeTreeData.event;

    public readonly dragMimeTypes = ['application/vnd.code.tree.multifileitem'];
    public readonly dropMimeTypes = ['application/vnd.code.tree.multifileitem'];

    private codeMover: CodeMover;
    private trackedDocuments: Map<string, vscode.TextDocument> = new Map();
    private symbolCache: SymbolCache;

    constructor() {
        this.codeMover = new CodeMover();
        this.symbolCache = SymbolCache.getInstance();
        this.initializeTracking();
    }

    private initializeTracking(): void {
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

    private isCodeFile(doc: vscode.TextDocument): boolean {
        const ext = doc.fileName.split('.').pop()?.toLowerCase();
        return ['ts', 'js', 'tsx', 'jsx', 'py', 'java', 'cs', 'cpp', 'go', 'rs', 'php', 'rb'].includes(ext || '');
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: MultiFileItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: MultiFileItem): Promise<MultiFileItem[]> {
        if (!element) {
            // Root level: show all tracked files
            const fileItems: MultiFileItem[] = [];
            
            // Check cache first for each document
            for (const doc of this.trackedDocuments.values()) {
                const cachedSymbols = this.symbolCache.get(doc.uri, doc.version);
                if (cachedSymbols) {
                    // Use cached symbols if available
                    const symbolItems = cachedSymbols.map(symbol => 
                        new MultiFileItem(
                            symbol.name,
                            vscode.TreeItemCollapsibleState.None,
                            'symbol',
                            doc,
                            symbol
                        )
                    );
                    
                    if (symbolItems.length > 0) {
                        fileItems.push(
                            new MultiFileItem(
                                doc.fileName.split('/').pop() || 'Untitled',
                                vscode.TreeItemCollapsibleState.Collapsed,
                                'file',
                                doc,
                                undefined,
                                symbolItems
                            )
                        );
                    }
                } else {
                    // Otherwise, parse the document
                    const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
                        'vscode.executeDocumentSymbolProvider',
                        doc.uri
                    );

                    if (symbols && symbols.length > 0) {
                        // Cache the parsed symbols
                        this.symbolCache.set(doc.uri, doc.version, symbols);
                        
                        const symbolItems = symbols.map(symbol => 
                            new MultiFileItem(
                                symbol.name,
                                vscode.TreeItemCollapsibleState.None,
                                'symbol',
                                doc,
                                symbol
                            )
                        );

                        fileItems.push(
                            new MultiFileItem(
                                doc.fileName.split('/').pop() || 'Untitled',
                                vscode.TreeItemCollapsibleState.Collapsed,
                                'file',
                                doc,
                                undefined,
                                symbolItems
                            )
                        );
                    }
                }
            }
            
            for (const [path, doc] of this.trackedDocuments) {
                const fileName = path.split(/[\\/]/).pop() || path;
                fileItems.push(new MultiFileItem(
                    fileName,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'file',
                    doc,
                    undefined,
                    []
                ));
            }
            
            return fileItems.sort((a, b) => a.label.localeCompare(b.label));
        }

        if (element.itemType === 'file' && element.document) {
            // File level: show symbols
            const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
                'vscode.executeDocumentSymbolProvider',
                element.document.uri
            );

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
    }

    private mapSymbolsToItems(symbols: vscode.DocumentSymbol[], document: vscode.TextDocument): MultiFileItem[] {
        return symbols.map(symbol => {
            const children = this.mapSymbolsToItems(symbol.children, document);
            return new MultiFileItem(
                symbol.name,
                children.length > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
                'symbol',
                document,
                symbol,
                children
            );
        });
    }

    // Drag and Drop Implementation

    public async handleDrag(source: MultiFileItem[], dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): Promise<void> {
        // Handle both single and multi-item drag
        if (source && source.length > 0) {
            dataTransfer.set('application/vnd.code.tree.multifileitem', new vscode.DataTransferItem(source));
        }
        return Promise.resolve();
    }

    public async handleDrop(target: MultiFileItem | undefined, dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): Promise<void> {
        const transferItem = dataTransfer.get('application/vnd.code.tree.multifileitem');
        if (!transferItem) {
            return;
        }

        const sourceItems: MultiFileItem[] = Array.isArray(transferItem.value) 
            ? transferItem.value 
            : [transferItem.value];

        if (sourceItems.length === 0) {
            return;
        }

        // Determine target document and position
        let targetDocument: vscode.TextDocument | undefined;
        let targetPosition: vscode.Position | undefined;

        if (!target) {
            // Dropped on empty space - use active editor
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No target file selected');
                return;
            }
            targetDocument = editor.document;
            targetPosition = new vscode.Position(targetDocument.lineCount, 0);
        } else if (target.itemType === 'file' && target.document) {
            // Dropped on a file - append to end
            targetDocument = target.document;
            targetPosition = new vscode.Position(targetDocument.lineCount, 0);
        } else if (target.itemType === 'symbol' && target.document && target.symbol) {
            // Dropped on a symbol - insert before that symbol
            targetDocument = target.document;
            targetPosition = target.symbol.range.start;
        } else {
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
                await this.moveSameFile(sourceItem, targetPosition!);
            } else {
                // Different file: use CodeMover for cross-file operation
                await this.moveCrossFile(sourceItem, targetDocument, targetPosition!);
            }
            
            // Invalidate cache for affected files
            this.symbolCache.invalidate(sourceItem.document.uri);
            this.symbolCache.invalidate(targetDocument.uri);
        }

        this.refresh();
    }

    private async moveSameFile(sourceItem: MultiFileItem, targetPosition: vscode.Position): Promise<void> {
        if (!sourceItem.document || !sourceItem.symbol) {
            return;
        }

        const editor = await vscode.window.showTextDocument(sourceItem.document);
        const sourceRange = sourceItem.symbol.range;
        const sourceText = sourceItem.document.getText(sourceRange).trim();
        
        const sourceStart = sourceRange.start;
        const sourceIsBeforeTarget = sourceStart.isBefore(targetPosition);
        
        await editor.edit(editBuilder => {
            if (sourceIsBeforeTarget) {
                editBuilder.delete(sourceRange);
                const deletedLines = sourceRange.end.line - sourceRange.start.line + 1;
                const adjustedTarget = targetPosition.translate(-deletedLines, 0);
                editBuilder.insert(adjustedTarget, sourceText + '\n\n');
            } else {
                editBuilder.insert(targetPosition, sourceText + '\n\n');
                const insertedLines = sourceText.split('\n').length + 2;
                const adjustedSource = new vscode.Range(
                    sourceRange.start.translate(insertedLines, 0),
                    sourceRange.end.translate(insertedLines, 0)
                );
                editBuilder.delete(adjustedSource);
            }
        });

        vscode.window.showInformationMessage('✅ Code moved successfully!');
    }

private async moveCrossFile(sourceItem: MultiFileItem, targetDocument: vscode.TextDocument, targetPosition: vscode.Position): Promise<void> {
        if (!sourceItem.document || !sourceItem.symbol) {
            return;
        }

        try {
            const success = await this.codeMover.moveSymbol(
                sourceItem.document,
                targetDocument,
                sourceItem.symbol,
                targetPosition
            );

            if (success) {
                vscode.window.showInformationMessage(`✅ Moved ${sourceItem.symbol.name} to ${targetDocument.fileName.split(/[\\/]/).pop()}`);
                
                // Open target file to show the result
                await vscode.window.showTextDocument(targetDocument);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`❌ Failed to move code: ${error}`);
        }
    }

    public dispose(): void {
        // Cleanup if needed
    }
}
