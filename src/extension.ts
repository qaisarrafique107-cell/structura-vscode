import * as vscode from 'vscode';
import { MultiFileProvider } from './multiFileProvider';
import { ContextMenuHandler } from './contextMenuHandler';

export function activate(context: vscode.ExtensionContext) {
    const multiFileProvider = new MultiFileProvider();
    const contextMenuHandler = new ContextMenuHandler();
    
    // Register context menu commands
    contextMenuHandler.registerCommands(context);
    
    // Create the Tree View with multi-file support
    const treeView = vscode.window.createTreeView('structuraView', {
        treeDataProvider: multiFileProvider,
        dragAndDropController: multiFileProvider,
        canSelectMany: true, // Enable multi-select
        showCollapseAll: true
    });

    context.subscriptions.push(treeView);

    // Refresh on editor change
    const editorChange = vscode.window.onDidChangeActiveTextEditor(() => {
        multiFileProvider.refresh();
    });
    
    // Refresh on document save
    const docSave = vscode.workspace.onDidSaveTextDocument(() => {
        multiFileProvider.refresh();
    });

    context.subscriptions.push(editorChange);
    context.subscriptions.push(docSave);
    
    // Register refresh command
    context.subscriptions.push(
        vscode.commands.registerCommand('structura.refresh', () => {
            multiFileProvider.refresh();
            vscode.window.showInformationMessage('Structura refreshed');
        })
    );
    
    // Initial refresh
    multiFileProvider.refresh();

    console.log('Structura extension activated with multi-file drag-drop support!');
}

export function deactivate() {}
