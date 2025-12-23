import * as vscode from 'vscode';
import { ImportManager } from './importManager';

/**
 * Handles moving code between files
 */
export class CodeMover {
    private importManager: ImportManager;

    constructor() {
        this.importManager = new ImportManager();
    }

    /**
     * Move a symbol (function/class) from source file to target file
     */
    public async moveSymbol(
        sourceDocument: vscode.TextDocument,
        targetDocument: vscode.TextDocument,
        symbol: vscode.DocumentSymbol,
        targetPosition: vscode.Position
    ): Promise<boolean> {
        try {
            // Extract the code
            const symbolText = sourceDocument.getText(symbol.range).trim();
            const symbolName = symbol.name;

            // Check if moving to different file
            const isDifferentFile = sourceDocument.uri.fsPath !== targetDocument.uri.fsPath;

            if (isDifferentFile) {
                // Add export to source file if not already exported
                await this.ensureExported(sourceDocument, symbol);

                // Add import to target file
                await this.importManager.addImport(
                    targetDocument,
                    symbolName,
                    sourceDocument.uri.fsPath
                );
            }

            // Insert code into target file
            await this.insertCode(targetDocument, targetPosition, symbolText);

            // Remove code from source file
            await this.removeCode(sourceDocument, symbol.range);

            // Clean up unused imports in source file
            if (isDifferentFile) {
                await this.importManager.removeUnusedImport(sourceDocument, symbolName);
            }

            return true;
        } catch (error) {
            console.error('Error moving symbol:', error);
            vscode.window.showErrorMessage(`Failed to move code: ${error}`);
            return false;
        }
    }

    /**
     * Insert code at target position
     */
    private async insertCode(
        document: vscode.TextDocument,
        position: vscode.Position,
        code: string
    ): Promise<void> {
        const edit = new vscode.WorkspaceEdit();
        
        // Add proper spacing
        const targetLine = document.lineAt(position.line);
        const needsSpacing = targetLine.text.trim().length > 0;
        const textToInsert = code + (needsSpacing ? '\n\n' : '\n');

        edit.insert(document.uri, position, textToInsert);
        await vscode.workspace.applyEdit(edit);
    }

    /**
     * Remove code from source location
     */
    private async removeCode(
        document: vscode.TextDocument,
        range: vscode.Range
    ): Promise<void> {
        const edit = new vscode.WorkspaceEdit();
        
        // Include the line break after the code
        const extendedRange = new vscode.Range(
            range.start,
            document.lineAt(range.end.line).rangeIncludingLineBreak.end
        );

        edit.delete(document.uri, extendedRange);
        await vscode.workspace.applyEdit(edit);
    }

    /**
     * Ensure symbol is exported in source file
     */
    private async ensureExported(
        document: vscode.TextDocument,
        symbol: vscode.DocumentSymbol
    ): Promise<void> {
        const symbolText = document.getText(symbol.range);
        
        // Check if already exported
        if (symbolText.startsWith('export ')) {
            return;
        }

        // Add export keyword
        const edit = new vscode.WorkspaceEdit();
        edit.insert(document.uri, symbol.range.start, 'export ');
        await vscode.workspace.applyEdit(edit);
    }

    /**
     * Check if two files are in the same workspace
     */
    private isSameWorkspace(file1: vscode.Uri, file2: vscode.Uri): boolean {
        const workspace1 = vscode.workspace.getWorkspaceFolder(file1);
        const workspace2 = vscode.workspace.getWorkspaceFolder(file2);
        return workspace1 === workspace2;
    }
}
