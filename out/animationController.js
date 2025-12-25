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
exports.AnimationController = void 0;
const vscode = require("vscode");
/**
 * Manages drag-drop animations and visual feedback
 */
class AnimationController {
    constructor() {
        // Create decoration types for visual feedback
        this.dropZoneDecoration = vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor('editor.wordHighlightBackground'),
            border: '2px dashed',
            borderColor: new vscode.ThemeColor('editorInfo.foreground'),
            isWholeLine: true
        });
        this.dragPreviewDecoration = vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor('editor.selectionBackground'),
            opacity: '0.5',
            isWholeLine: true
        });
    }
    static getInstance() {
        if (!AnimationController.instance) {
            AnimationController.instance = new AnimationController();
        }
        return AnimationController.instance;
    }
    /**
     * Highlight drop zone during drag
     */
    highlightDropZone(editor, position) {
        const range = new vscode.Range(position, position);
        editor.setDecorations(this.dropZoneDecoration, [range]);
    }
    /**
     * Clear drop zone highlight
     */
    clearDropZone(editor) {
        editor.setDecorations(this.dropZoneDecoration, []);
    }
    /**
     * Show drag preview
     */
    showDragPreview(editor, range) {
        editor.setDecorations(this.dragPreviewDecoration, [range]);
    }
    /**
     * Clear drag preview
     */
    clearDragPreview(editor) {
        editor.setDecorations(this.dragPreviewDecoration, []);
    }
    /**
     * Animate successful drop
     */
    animateDrop(editor, range) {
        return __awaiter(this, void 0, void 0, function* () {
            // Flash the dropped code
            const flashDecoration = vscode.window.createTextEditorDecorationType({
                backgroundColor: new vscode.ThemeColor('editorInfo.background'),
                isWholeLine: true
            });
            editor.setDecorations(flashDecoration, [range]);
            // Remove after 500ms
            setTimeout(() => {
                editor.setDecorations(flashDecoration, []);
                flashDecoration.dispose();
            }, 500);
        });
    }
    /**
     * Show status bar feedback during drag
     */
    showDragFeedback(message) {
        const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        statusBar.text = `$(loading~spin) ${message}`;
        statusBar.show();
        return statusBar;
    }
    /**
     * Show success feedback
     */
    showSuccessFeedback(message) {
        const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        statusBar.text = `$(check) ${message}`;
        statusBar.show();
        setTimeout(() => {
            statusBar.dispose();
        }, 2000);
    }
    /**
     * Dispose all decorations
     */
    dispose() {
        this.dropZoneDecoration.dispose();
        this.dragPreviewDecoration.dispose();
    }
}
exports.AnimationController = AnimationController;
//# sourceMappingURL=animationController.js.map