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
exports.WorkspaceProvider = void 0;
const vscode = require("vscode");
/**
 * Tracks and manages workspace files for cross-file operations
 */
class WorkspaceProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.workspaceFiles = new Map();
        this.initializeWorkspace();
        this.setupFileWatcher();
    }
    /**
     * Initialize workspace by finding all relevant files
     */
    initializeWorkspace() {
        return __awaiter(this, void 0, void 0, function* () {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                return;
            }
            // Find all code files in workspace
            const patterns = [
                '**/*.ts',
                '**/*.js',
                '**/*.tsx',
                '**/*.jsx',
                '**/*.py',
                '**/*.java',
                '**/*.cs',
                '**/*.cpp',
                '**/*.go',
                '**/*.rs'
            ];
            for (const pattern of patterns) {
                const files = yield vscode.workspace.findFiles(pattern, '**/node_modules/**');
                for (const file of files) {
                    try {
                        const document = yield vscode.workspace.openTextDocument(file);
                        this.workspaceFiles.set(file.fsPath, document);
                    }
                    catch (error) {
                        console.error(`Error opening file ${file.fsPath}:`, error);
                    }
                }
            }
            this.refresh();
        });
    }
    /**
     * Setup file watcher for workspace changes
     */
    setupFileWatcher() {
        this.fileWatcher = vscode.workspace.createFileSystemWatcher('**/*.{ts,js,tsx,jsx,py,java,cs,cpp,go,rs}');
        this.fileWatcher.onDidCreate((uri) => __awaiter(this, void 0, void 0, function* () {
            const document = yield vscode.workspace.openTextDocument(uri);
            this.workspaceFiles.set(uri.fsPath, document);
            this.refresh();
        }));
        this.fileWatcher.onDidDelete((uri) => {
            this.workspaceFiles.delete(uri.fsPath);
            this.refresh();
        });
        this.fileWatcher.onDidChange((uri) => __awaiter(this, void 0, void 0, function* () {
            const document = yield vscode.workspace.openTextDocument(uri);
            this.workspaceFiles.set(uri.fsPath, document);
            this.refresh();
        }));
    }
    /**
     * Get all workspace files
     */
    getWorkspaceFiles() {
        return Array.from(this.workspaceFiles.values());
    }
    /**
     * Get file by path
     */
    getFile(path) {
        return this.workspaceFiles.get(path);
    }
    /**
     * Check if file exists in workspace
     */
    hasFile(path) {
        return this.workspaceFiles.has(path);
    }
    /**
     * Refresh the workspace view
     */
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    /**
     * Dispose resources
     */
    dispose() {
        if (this.fileWatcher) {
            this.fileWatcher.dispose();
        }
    }
}
exports.WorkspaceProvider = WorkspaceProvider;
//# sourceMappingURL=workspaceProvider.js.map