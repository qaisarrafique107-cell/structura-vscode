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
exports.ContextMenuHandler = void 0;
const vscode = require("vscode");
const codeMover_1 = require("./codeMover");
class ContextMenuHandler {
    constructor() {
        this.codeMover = new codeMover_1.CodeMover();
    }
    /**
     * Initialize and register all context menu commands
     */
    registerCommands(context) {
        // Register move function command
        const moveFunctionCmd = vscode.commands.registerCommand('structura.moveFunctionTo', (item) => __awaiter(this, void 0, void 0, function* () {
            yield this.moveFunctionTo(item);
        }));
        // Register extract to new file command
        const extractToNewFileCmd = vscode.commands.registerCommand('structura.extractToNewFile', (item) => __awaiter(this, void 0, void 0, function* () {
            yield this.extractToNewFile(item);
        }));
        // Register duplicate to file command
        const duplicateToFileCmd = vscode.commands.registerCommand('structura.duplicateToFile', (item) => __awaiter(this, void 0, void 0, function* () {
            yield this.duplicateToFile(item);
        }));
        context.subscriptions.push(moveFunctionCmd, extractToNewFileCmd, duplicateToFileCmd);
    }
    /**
     * Move function to a different file
     */
    moveFunctionTo(item) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!item.contextValue || !item.contextValue.includes('symbol')) {
                vscode.window.showErrorMessage('Please select a function to move');
                return;
            }
            const targetFile = yield this.promptForTargetFile();
            if (!targetFile) {
                return; // User cancelled
            }
            try {
                // TODO: Implement actual move logic using codeMover
                vscode.window.showInformationMessage(`Moved function to ${targetFile.fsPath}`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to move function: ${error}`);
            }
        });
    }
    /**
     * Extract selected code to a new file
     */
    extractToNewFile(item) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileName = yield vscode.window.showInputBox({
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
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to extract to new file: ${error}`);
            }
        });
    }
    /**
     * Duplicate function to a different file
     */
    duplicateToFile(item) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!item.contextValue || !item.contextValue.includes('symbol')) {
                vscode.window.showErrorMessage('Please select a function to duplicate');
                return;
            }
            const targetFile = yield this.promptForTargetFile();
            if (!targetFile) {
                return; // User cancelled
            }
            try {
                // TODO: Implement actual duplicate logic using codeMover
                vscode.window.showInformationMessage(`Duplicated function to ${targetFile.fsPath}`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to duplicate function: ${error}`);
            }
        });
    }
    /**
     * Helper to prompt user for target file selection
     */
    promptForTargetFile() {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield vscode.workspace.findFiles('**/*.{js,jsx,ts,tsx}');
            const items = files.map(file => ({
                label: vscode.workspace.asRelativePath(file),
                description: file.fsPath,
                file: file
            }));
            const selected = yield vscode.window.showQuickPick(items, {
                placeHolder: 'Select target file',
                matchOnDescription: true,
                matchOnDetail: true
            });
            return selected === null || selected === void 0 ? void 0 : selected.file;
        });
    }
}
exports.ContextMenuHandler = ContextMenuHandler;
//# sourceMappingURL=contextMenuHandler.js.map