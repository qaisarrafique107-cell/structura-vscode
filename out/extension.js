"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const structuraProvider_1 = require("./structuraProvider");
function activate(context) {
    const structuraProvider = new structuraProvider_1.StructuraProvider();
    // Create the Tree View
    const treeView = vscode.window.createTreeView('structuraView', {
        treeDataProvider: structuraProvider,
        dragAndDropController: structuraProvider,
        canSelectMany: false
    });
    context.subscriptions.push(treeView);
    // Refresh on editor change (Active Editor Changed)
    const editorChange = vscode.window.onDidChangeActiveTextEditor(() => {
        structuraProvider.refresh();
    });
    // Also refresh on Save (Document Changed/Saved) to keep tree in sync
    const docSave = vscode.workspace.onDidSaveTextDocument(() => {
        structuraProvider.refresh();
    });
    context.subscriptions.push(editorChange);
    context.subscriptions.push(docSave);
    // Initial refresh
    structuraProvider.refresh();
    console.log('Structura extension activated successfully!');
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map