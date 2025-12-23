import * as vscode from 'vscode';

/**
 * Manages automatic import statements when moving code between files
 */
export class ImportManager {
    /**
     * Add import statement to target file
     */
    public async addImport(
        targetDocument: vscode.TextDocument,
        symbolName: string,
        sourceFilePath: string
    ): Promise<void> {
        const edit = new vscode.WorkspaceEdit();
        const relativePath = this.getRelativePath(targetDocument.uri.fsPath, sourceFilePath);
        
        // Detect existing imports
        const existingImports = this.findExistingImports(targetDocument);
        const importStatement = this.generateImportStatement(symbolName, relativePath, targetDocument.languageId);
        
        // Find insertion position (after existing imports or at top)
        const insertPosition = this.getImportInsertPosition(targetDocument, existingImports);
        
        edit.insert(targetDocument.uri, insertPosition, importStatement + '\n');
        await vscode.workspace.applyEdit(edit);
    }

    /**
     * Remove unused imports from source file
     */
    public async removeUnusedImport(
        document: vscode.TextDocument,
        symbolName: string
    ): Promise<void> {
        // Check if symbol is still used in the file
        const text = document.getText();
        const symbolRegex = new RegExp(`\\b${symbolName}\\b`, 'g');
        const matches = text.match(symbolRegex);
        
        // If only one match (the import itself), remove it
        if (matches && matches.length === 1) {
            const edit = new vscode.WorkspaceEdit();
            const importLine = this.findImportLine(document, symbolName);
            
            if (importLine !== -1) {
                const lineRange = document.lineAt(importLine).rangeIncludingLineBreak;
                edit.delete(document.uri, lineRange);
                await vscode.workspace.applyEdit(edit);
            }
        }
    }

    /**
     * Generate import statement based on language
     */
    private generateImportStatement(symbolName: string, path: string, languageId: string): string {
        switch (languageId) {
            case 'typescript':
            case 'javascript':
            case 'typescriptreact':
            case 'javascriptreact':
                return `import { ${symbolName} } from '${path}';`;
            
            case 'python':
                const moduleName = path.replace(/\//g, '.').replace(/\.py$/, '');
                return `from ${moduleName} import ${symbolName}`;
            
            default:
                return `// Import ${symbolName} from ${path}`;
        }
    }

    /**
     * Get relative path between two files
     */
    private getRelativePath(fromPath: string, toPath: string): string {
        const path = require('path');
        let relative = path.relative(path.dirname(fromPath), toPath);
        
        // Remove file extension for JS/TS
        relative = relative.replace(/\.(ts|js|tsx|jsx)$/, '');
        
        // Ensure it starts with ./ or ../
        if (!relative.startsWith('.')) {
            relative = './' + relative;
        }
        
        return relative;
    }

    /**
     * Find existing import statements in document
     */
    private findExistingImports(document: vscode.TextDocument): number[] {
        const importLines: number[] = [];
        const text = document.getText();
        const lines = text.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('import ') || line.startsWith('from ')) {
                importLines.push(i);
            } else if (line && !line.startsWith('//') && !line.startsWith('/*')) {
                // Stop at first non-import, non-comment line
                break;
            }
        }
        
        return importLines;
    }

    /**
     * Get position to insert new import
     */
    private getImportInsertPosition(document: vscode.TextDocument, existingImports: number[]): vscode.Position {
        if (existingImports.length > 0) {
            // Insert after last import
            const lastImportLine = existingImports[existingImports.length - 1];
            return new vscode.Position(lastImportLine + 1, 0);
        } else {
            // Insert at top of file
            return new vscode.Position(0, 0);
        }
    }

    /**
     * Find line number of import statement for a symbol
     */
    private findImportLine(document: vscode.TextDocument, symbolName: string): number {
        const text = document.getText();
        const lines = text.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes(`import`) && line.includes(symbolName)) {
                return i;
            }
        }
        
        return -1;
    }
}
