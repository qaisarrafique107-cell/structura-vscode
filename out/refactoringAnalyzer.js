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
exports.RefactoringAnalyzer = void 0;
const vscode = require("vscode");
/**
 * Analyzes workspace for refactoring opportunities
 */
class RefactoringAnalyzer {
    constructor() {
        this.insights = [];
        this.stats = null;
        this.analyzing = false;
    }
    static getInstance() {
        if (!RefactoringAnalyzer.instance) {
            RefactoringAnalyzer.instance = new RefactoringAnalyzer();
        }
        return RefactoringAnalyzer.instance;
    }
    /**
     * Analyze entire workspace
     */
    analyzeWorkspace() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.analyzing) {
                vscode.window.showInformationMessage('Analysis already in progress');
                return;
            }
            this.analyzing = true;
            this.insights = [];
            try {
                yield vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: 'Analyzing workspace...',
                    cancellable: false
                }, (progress) => __awaiter(this, void 0, void 0, function* () {
                    // Find all code files
                    const files = yield vscode.workspace.findFiles('**/*.{ts,js,tsx,jsx,py,java,cs}', '**/node_modules/**');
                    progress.report({ message: `Found ${files.length} files` });
                    let totalFunctions = 0;
                    let totalClasses = 0;
                    let totalSize = 0;
                    let largestFile = '';
                    let largestSize = 0;
                    // Analyze each file
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        progress.report({
                            message: `Analyzing ${i + 1}/${files.length}`,
                            increment: (1 / files.length) * 100
                        });
                        try {
                            const document = yield vscode.workspace.openTextDocument(file);
                            const symbols = yield vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', file);
                            if (symbols) {
                                // Count functions and classes
                                const { functions, classes } = this.countSymbols(symbols);
                                totalFunctions += functions;
                                totalClasses += classes;
                                // Check file size
                                const size = document.lineCount;
                                totalSize += size;
                                if (size > largestSize) {
                                    largestSize = size;
                                    largestFile = vscode.workspace.asRelativePath(file);
                                }
                                // Detect large files
                                if (size > 500) {
                                    this.insights.push({
                                        type: 'large-file',
                                        severity: 'warning',
                                        message: `Large file (${size} lines)`,
                                        file: vscode.workspace.asRelativePath(file),
                                        suggestion: 'Consider splitting into smaller modules'
                                    });
                                }
                                // Detect duplicate function names
                                yield this.detectDuplicates(symbols, file);
                            }
                        }
                        catch (error) {
                            // Skip files that can't be analyzed
                        }
                    }
                    // Calculate statistics
                    this.stats = {
                        totalFiles: files.length,
                        totalFunctions,
                        totalClasses,
                        averageFileSize: Math.round(totalSize / files.length),
                        largestFile,
                        organizationScore: this.calculateOrganizationScore(files.length, totalFunctions, totalSize)
                    };
                }));
                vscode.window.showInformationMessage(`✅ Analysis complete: ${this.insights.length} insights found`);
            }
            finally {
                this.analyzing = false;
            }
        });
    }
    /**
     * Count symbols in document
     */
    countSymbols(symbols) {
        let functions = 0;
        let classes = 0;
        for (const symbol of symbols) {
            if (symbol.kind === vscode.SymbolKind.Function || symbol.kind === vscode.SymbolKind.Method) {
                functions++;
            }
            else if (symbol.kind === vscode.SymbolKind.Class) {
                classes++;
            }
            // Recursively count children
            const childCounts = this.countSymbols(symbol.children);
            functions += childCounts.functions;
            classes += childCounts.classes;
        }
        return { functions, classes };
    }
    /**
     * Detect duplicate function names across files
     */
    detectDuplicates(symbols, file) {
        return __awaiter(this, void 0, void 0, function* () {
            // Simple duplicate detection (can be enhanced)
            const functionNames = new Set();
            const extractNames = (syms) => {
                for (const sym of syms) {
                    if (sym.kind === vscode.SymbolKind.Function) {
                        if (functionNames.has(sym.name)) {
                            this.insights.push({
                                type: 'duplicate',
                                severity: 'info',
                                message: `Duplicate function name: ${sym.name}`,
                                file: vscode.workspace.asRelativePath(file),
                                line: sym.range.start.line,
                                suggestion: 'Consider renaming or merging'
                            });
                        }
                        functionNames.add(sym.name);
                    }
                    extractNames(sym.children);
                }
            };
            extractNames(symbols);
        });
    }
    /**
     * Calculate organization score (0-100)
     */
    calculateOrganizationScore(files, functions, totalSize) {
        // Simple scoring algorithm
        const avgFunctionsPerFile = functions / files;
        const avgLinesPerFile = totalSize / files;
        let score = 100;
        // Penalize if too many functions per file
        if (avgFunctionsPerFile > 20) {
            score -= 20;
        }
        // Penalize if files are too large
        if (avgLinesPerFile > 300) {
            score -= 20;
        }
        // Penalize based on insights
        score -= this.insights.length * 2;
        return Math.max(0, Math.min(100, score));
    }
    /**
     * Get all insights
     */
    getInsights() {
        return this.insights;
    }
    /**
     * Get workspace statistics
     */
    getStats() {
        return this.stats;
    }
    /**
     * Clear insights
     */
    clear() {
        this.insights = [];
        this.stats = null;
    }
}
exports.RefactoringAnalyzer = RefactoringAnalyzer;
//# sourceMappingURL=refactoringAnalyzer.js.map