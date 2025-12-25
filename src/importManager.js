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
exports.ImportManager = void 0;
const vscode = require("vscode");
/**
 * Manages automatic import statements when moving code between files
 */
class ImportManager {
    /**
     * Add import statement to target file
     */
    addImport(targetDocument, symbolName, sourceFilePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const edit = new vscode.WorkspaceEdit();
            const relativePath = this.getRelativePath(targetDocument.uri.fsPath, sourceFilePath);
            // Detect existing imports
            const existingImports = this.findExistingImports(targetDocument);
            const importStatement = this.generateImportStatement(symbolName, relativePath, targetDocument.languageId);
            // Find insertion position (after existing imports or at top)
            const insertPosition = this.getImportInsertPosition(targetDocument, existingImports);
            edit.insert(targetDocument.uri, insertPosition, importStatement + '\n');
            yield vscode.workspace.applyEdit(edit);
        });
    }
    /**
     * Remove unused imports from source file
     */
    removeUnusedImport(document, symbolName) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    yield vscode.workspace.applyEdit(edit);
                }
            }
        });
    }
    /**
     * Generate import statement based on language
     */
    generateImportStatement(symbolName, path, languageId) {
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
    getRelativePath(fromPath, toPath) {
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
    findExistingImports(document) {
        const importLines = [];
        const text = document.getText();
        const lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('import ') || line.startsWith('from ')) {
                importLines.push(i);
            }
            else if (line && !line.startsWith('//') && !line.startsWith('/*')) {
                // Stop at first non-import, non-comment line
                break;
            }
        }
        return importLines;
    }
    /**
     * Get position to insert new import
     */
    getImportInsertPosition(document, existingImports) {
        if (existingImports.length > 0) {
            // Insert after last import
            const lastImportLine = existingImports[existingImports.length - 1];
            return new vscode.Position(lastImportLine + 1, 0);
        }
        else {
            // Insert at top of file
            return new vscode.Position(0, 0);
        }
    }
    /**
     * Find line number of import statement for a symbol
     */
    findImportLine(document, symbolName) {
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
exports.ImportManager = ImportManager;
//# sourceMappingURL=importManager.js.map