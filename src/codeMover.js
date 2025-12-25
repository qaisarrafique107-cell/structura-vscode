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
exports.CodeMover = void 0;
const vscode = require("vscode");
const importManager_1 = require("./importManager");
/**
 * Handles moving code between files
 */
class CodeMover {
    constructor() {
        this.importManager = new importManager_1.ImportManager();
    }
    /**
     * Move a symbol (function/class) from source file to target file
     */
    moveSymbol(sourceDocument, targetDocument, symbol, targetPosition) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Extract the code
                const symbolText = sourceDocument.getText(symbol.range).trim();
                const symbolName = symbol.name;
                // Check if moving to different file
                const isDifferentFile = sourceDocument.uri.fsPath !== targetDocument.uri.fsPath;
                if (isDifferentFile) {
                    // Add export to source file if not already exported
                    yield this.ensureExported(sourceDocument, symbol);
                    // Add import to target file
                    yield this.importManager.addImport(targetDocument, symbolName, sourceDocument.uri.fsPath);
                }
                // Insert code into target file
                yield this.insertCode(targetDocument, targetPosition, symbolText);
                // Remove code from source file
                yield this.removeCode(sourceDocument, symbol.range);
                // Clean up unused imports in source file
                if (isDifferentFile) {
                    yield this.importManager.removeUnusedImport(sourceDocument, symbolName);
                }
                return true;
            }
            catch (error) {
                console.error('Error moving symbol:', error);
                vscode.window.showErrorMessage(`Failed to move code: ${error}`);
                return false;
            }
        });
    }
    /**
     * Insert code at target position
     */
    insertCode(document, position, code) {
        return __awaiter(this, void 0, void 0, function* () {
            const edit = new vscode.WorkspaceEdit();
            // Add proper spacing
            const targetLine = document.lineAt(position.line);
            const needsSpacing = targetLine.text.trim().length > 0;
            const textToInsert = code + (needsSpacing ? '\n\n' : '\n');
            edit.insert(document.uri, position, textToInsert);
            yield vscode.workspace.applyEdit(edit);
        });
    }
    /**
     * Remove code from source location
     */
    removeCode(document, range) {
        return __awaiter(this, void 0, void 0, function* () {
            const edit = new vscode.WorkspaceEdit();
            // Include the line break after the code
            const extendedRange = new vscode.Range(range.start, document.lineAt(range.end.line).rangeIncludingLineBreak.end);
            edit.delete(document.uri, extendedRange);
            yield vscode.workspace.applyEdit(edit);
        });
    }
    /**
     * Ensure symbol is exported in source file
     */
    ensureExported(document, symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            const symbolText = document.getText(symbol.range);
            // Check if already exported
            if (symbolText.startsWith('export ')) {
                return;
            }
            // Add export keyword
            const edit = new vscode.WorkspaceEdit();
            edit.insert(document.uri, symbol.range.start, 'export ');
            yield vscode.workspace.applyEdit(edit);
        });
    }
    /**
     * Check if two files are in the same workspace
     */
    isSameWorkspace(file1, file2) {
        const workspace1 = vscode.workspace.getWorkspaceFolder(file1);
        const workspace2 = vscode.workspace.getWorkspaceFolder(file2);
        return workspace1 === workspace2;
    }
}
exports.CodeMover = CodeMover;
//# sourceMappingURL=codeMover.js.map