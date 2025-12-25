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
exports.UndoManager = void 0;
const vscode = require("vscode");
/**
 * Manages undo/redo history with cursor position preservation
 */
class UndoManager {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
        this.maxStackSize = 50;
    }
    static getInstance() {
        if (!UndoManager.instance) {
            UndoManager.instance = new UndoManager();
        }
        return UndoManager.instance;
    }
    /**
     * Record an operation
     */
    recordOperation(operation) {
        this.undoStack.push(operation);
        this.redoStack = []; // Clear redo stack on new operation
        // Limit stack size
        if (this.undoStack.length > this.maxStackSize) {
            this.undoStack.shift();
        }
    }
    /**
     * Undo last operation
     */
    undo() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.undoStack.length === 0) {
                vscode.window.showInformationMessage('Nothing to undo');
                return false;
            }
            const operation = this.undoStack.pop();
            this.redoStack.push(operation);
            try {
                // VS Code's native undo
                yield vscode.commands.executeCommand('undo');
                // Restore cursor position
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    editor.selection = new vscode.Selection(operation.cursorPosition, operation.cursorPosition);
                    editor.revealRange(new vscode.Range(operation.cursorPosition, operation.cursorPosition), vscode.TextEditorRevealType.InCenter);
                }
                vscode.window.showInformationMessage(`✅ Undone: ${operation.type} ${operation.symbolName}`);
                return true;
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to undo: ${error}`);
                return false;
            }
        });
    }
    /**
     * Redo last undone operation
     */
    redo() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.redoStack.length === 0) {
                vscode.window.showInformationMessage('Nothing to redo');
                return false;
            }
            const operation = this.redoStack.pop();
            this.undoStack.push(operation);
            try {
                // VS Code's native redo
                yield vscode.commands.executeCommand('redo');
                vscode.window.showInformationMessage(`✅ Redone: ${operation.type} ${operation.symbolName}`);
                return true;
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to redo: ${error}`);
                return false;
            }
        });
    }
    /**
     * Get undo history
     */
    getUndoHistory() {
        return [...this.undoStack];
    }
    /**
     * Get redo history
     */
    getRedoHistory() {
        return [...this.redoStack];
    }
    /**
     * Clear all history
     */
    clear() {
        this.undoStack = [];
        this.redoStack = [];
    }
    /**
     * Show undo history in quick pick
     */
    showHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.undoStack.length === 0) {
                vscode.window.showInformationMessage('No undo history');
                return;
            }
            const items = this.undoStack.map((op, index) => ({
                label: `${op.type}: ${op.symbolName}`,
                description: `${op.sourceFile}${op.targetFile ? ' → ' + op.targetFile : ''}`,
                detail: new Date(op.timestamp).toLocaleString(),
                operation: op,
                index: index
            }));
            const selected = yield vscode.window.showQuickPick(items.reverse(), {
                placeHolder: 'Select operation to undo to'
            });
            if (selected) {
                // Undo multiple times to reach selected operation
                const undoCount = this.undoStack.length - selected.index;
                for (let i = 0; i < undoCount; i++) {
                    yield this.undo();
                }
            }
        });
    }
}
exports.UndoManager = UndoManager;
//# sourceMappingURL=undoManager.js.map