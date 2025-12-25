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
exports.InsightsProvider = exports.InsightItem = void 0;
const vscode = require("vscode");
const refactoringAnalyzer_1 = require("./refactoringAnalyzer");
/**
 * TreeItem for insights view
 */
class InsightItem extends vscode.TreeItem {
    constructor(label, collapsibleState, insight, command) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.insight = insight;
        this.command = command;
        if (insight) {
            this.tooltip = insight.suggestion || insight.message;
            this.description = insight.file;
            // Set icon based on severity
            switch (insight.severity) {
                case 'error':
                    this.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('errorForeground'));
                    break;
                case 'warning':
                    this.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('editorWarning.foreground'));
                    break;
                case 'info':
                    this.iconPath = new vscode.ThemeIcon('info', new vscode.ThemeColor('editorInfo.foreground'));
                    break;
            }
        }
    }
}
exports.InsightItem = InsightItem;
/**
 * Provides refactoring insights in TreeView
 */
class InsightsProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.analyzer = refactoringAnalyzer_1.RefactoringAnalyzer.getInstance();
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!element) {
                // Root level: show statistics and insights categories
                const items = [];
                // Statistics section
                const stats = this.analyzer.getStats();
                if (stats) {
                    items.push(this.createStatsItem(stats));
                }
                // Insights by category
                const insights = this.analyzer.getInsights();
                if (insights.length > 0) {
                    const categories = this.groupInsightsByType(insights);
                    for (const [type, typeInsights] of categories) {
                        items.push(new InsightItem(`${this.getTypeLabel(type)} (${typeInsights.length})`, vscode.TreeItemCollapsibleState.Expanded));
                    }
                }
                else {
                    items.push(new InsightItem('No insights yet - Click "Analyze Workspace"', vscode.TreeItemCollapsibleState.None));
                }
                return items;
            }
            else {
                // Show insights for category
                const insights = this.analyzer.getInsights();
                const categoryInsights = insights.filter(i => element.label.startsWith(this.getTypeLabel(i.type)));
                return categoryInsights.map(insight => new InsightItem(insight.message, vscode.TreeItemCollapsibleState.None, insight, {
                    command: 'structura.openInsight',
                    title: 'Open',
                    arguments: [insight]
                }));
            }
        });
    }
    createStatsItem(stats) {
        const item = new InsightItem(`📊 Workspace Statistics`, vscode.TreeItemCollapsibleState.Expanded);
        item.description = `Score: ${stats.organizationScore}/100`;
        return item;
    }
    groupInsightsByType(insights) {
        const groups = new Map();
        for (const insight of insights) {
            if (!groups.has(insight.type)) {
                groups.set(insight.type, []);
            }
            groups.get(insight.type).push(insight);
        }
        return groups;
    }
    getTypeLabel(type) {
        switch (type) {
            case 'duplicate': return '🔄 Duplicates';
            case 'large-file': return '📦 Large Files';
            case 'circular-dependency': return '🔁 Circular Dependencies';
            case 'unused-export': return '🗑️ Unused Exports';
            case 'organization': return '📋 Organization';
            default: return type;
        }
    }
}
exports.InsightsProvider = InsightsProvider;
//# sourceMappingURL=insightsProvider.js.map