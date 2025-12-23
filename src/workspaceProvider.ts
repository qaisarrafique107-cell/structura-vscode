import * as vscode from 'vscode';

/**
 * Tracks and manages workspace files for cross-file operations
 */
export class WorkspaceProvider {
    private _onDidChangeTreeData: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    readonly onDidChangeTreeData: vscode.Event<void> = this._onDidChangeTreeData.event;

    private workspaceFiles: Map<string, vscode.TextDocument> = new Map();
    private fileWatcher: vscode.FileSystemWatcher | undefined;

    constructor() {
        this.initializeWorkspace();
        this.setupFileWatcher();
    }

    /**
     * Initialize workspace by finding all relevant files
     */
    private async initializeWorkspace(): Promise<void> {
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
            const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**');
            for (const file of files) {
                try {
                    const document = await vscode.workspace.openTextDocument(file);
                    this.workspaceFiles.set(file.fsPath, document);
                } catch (error) {
                    console.error(`Error opening file ${file.fsPath}:`, error);
                }
            }
        }

        this.refresh();
    }

    /**
     * Setup file watcher for workspace changes
     */
    private setupFileWatcher(): void {
        this.fileWatcher = vscode.workspace.createFileSystemWatcher('**/*.{ts,js,tsx,jsx,py,java,cs,cpp,go,rs}');

        this.fileWatcher.onDidCreate(async (uri) => {
            const document = await vscode.workspace.openTextDocument(uri);
            this.workspaceFiles.set(uri.fsPath, document);
            this.refresh();
        });

        this.fileWatcher.onDidDelete((uri) => {
            this.workspaceFiles.delete(uri.fsPath);
            this.refresh();
        });

        this.fileWatcher.onDidChange(async (uri) => {
            const document = await vscode.workspace.openTextDocument(uri);
            this.workspaceFiles.set(uri.fsPath, document);
            this.refresh();
        });
    }

    /**
     * Get all workspace files
     */
    public getWorkspaceFiles(): vscode.TextDocument[] {
        return Array.from(this.workspaceFiles.values());
    }

    /**
     * Get file by path
     */
    public getFile(path: string): vscode.TextDocument | undefined {
        return this.workspaceFiles.get(path);
    }

    /**
     * Check if file exists in workspace
     */
    public hasFile(path: string): boolean {
        return this.workspaceFiles.has(path);
    }

    /**
     * Refresh the workspace view
     */
    public refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    /**
     * Dispose resources
     */
    public dispose(): void {
        if (this.fileWatcher) {
            this.fileWatcher.dispose();
        }
    }
}
