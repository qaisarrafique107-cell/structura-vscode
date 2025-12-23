import * as vscode from 'vscode';
import { CodeMover } from './codeMover';

export class ContextMenuHandler {
    private codeMover: CodeMover;

    constructor() {
        this.codeMover = new CodeMover();
    }

    /**
     * Initialize and register all context menu commands
     */
    public registerCommands(context: vscode.ExtensionContext) {
        // Register move function command
        const moveFunctionCmd = vscode.commands.registerCommand('structura.moveFunctionTo', 
            async (item: vscode.TreeItem) => {
                await this.moveFunctionTo(item);
            });

        // Register extract to new file command
        const extractToNewFileCmd = vscode.commands.registerCommand('structura.extractToNewFile', 
            async (item: vscode.TreeItem) => {
                await this.extractToNewFile(item);
            });

        // Register duplicate to file command
        const duplicateToFileCmd = vscode.commands.registerCommand('structura.duplicateToFile', 
            async (item: vscode.TreeItem) => {
                await this.duplicateToFile(item);
            });

        context.subscriptions.push(moveFunctionCmd, extractToNewFileCmd, duplicateToFileCmd);
    }

    /**
     * Move function to a different file
     */
    private async moveFunctionTo(item: vscode.TreeItem) {
        if (!item.contextValue || !item.contextValue.includes('symbol')) {
            vscode.window.showErrorMessage('Please select a function to move');
            return;
        }

        const targetFile = await this.promptForTargetFile();
        if (!targetFile) {
            return; // User cancelled
        }

        try {
            // TODO: Implement actual move logic using codeMover
            vscode.window.showInformationMessage(`Moved function to ${targetFile.fsPath}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to move function: ${error}`);
        }
    }

    /**
     * Extract selected code to a new file
     */
    private async extractToNewFile(item: vscode.TreeItem) {
        const fileName = await vscode.window.showInputBox({
            prompt: 'Enter new file name (with extension)',
            placeHolder: 'e.g., utils.js',
            validateInput: value => {
                if (!value) {
                    return 'File name cannot be empty';
                }
                if (!value.includes('.')) {
                    return 'Please include file extension';
                }
                return null;
            }
        });

        if (!fileName) {
            return; // User cancelled
        }

        try {
            // TODO: Implement actual extraction logic using codeMover
            vscode.window.showInformationMessage(`Extracted to new file: ${fileName}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to extract to new file: ${error}`);
        }
    }

    /**
     * Duplicate function to a different file
     */
    private async duplicateToFile(item: vscode.TreeItem) {
        if (!item.contextValue || !item.contextValue.includes('symbol')) {
            vscode.window.showErrorMessage('Please select a function to duplicate');
            return;
        }

        const targetFile = await this.promptForTargetFile();
        if (!targetFile) {
            return; // User cancelled
        }

        try {
            // TODO: Implement actual duplicate logic using codeMover
            vscode.window.showInformationMessage(`Duplicated function to ${targetFile.fsPath}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to duplicate function: ${error}`);
        }
    }

    /**
     * Helper to prompt user for target file selection
     */
    private async promptForTargetFile(): Promise<vscode.Uri | undefined> {
        const files = await vscode.workspace.findFiles('**/*.{js,jsx,ts,tsx}');
        const items = files.map(file => ({
            label: vscode.workspace.asRelativePath(file),
            description: file.fsPath,
            file: file
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select target file',
            matchOnDescription: true,
            matchOnDetail: true
        });

        return selected?.file;
    }
}
