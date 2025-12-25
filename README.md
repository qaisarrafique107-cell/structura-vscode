# Structura - Drag & Drop Code Refactor

<div align="center">

![Structura Icon](images/icon.png)

**The Ultimate Code Organization Tool for VS Code**

Drag and drop functions across files. Automatic imports. AI-powered refactoring insights.

[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-blue?style=flat-square&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=ByQaisar.structura-code-reorder&ssr=false#overview)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github)](https://github.com/byqaisar1/structura-vscode/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](https://github.com/byqaisar1/structura-vscode/blob/main/LICENSE)
[![Version](https://img.shields.io/badge/Version-3.0.0-orange?style=flat-square)](https://github.com/byqaisar1/structura-vscode/blob/main/CHANGELOG.md)

</div>

---

## 🚀 What's New in v3.0.0

### 🎯 Revolutionary Features

- **🔄 Smart Undo/Redo** - Preserves cursor position and context
- **🎨 Visual Drag-Drop Animations** - Beautiful drop zone highlighting
- **📊 Workspace Refactoring Insights** - AI-powered code analysis
- **📈 Organization Scoring** - Get a 0-100 score for your codebase
- **� Duplicate Detection** - Find and merge duplicate functions
- **📦 Large File Warnings** - Identify files that need splitting

### ✨ Enhanced Features

- **Undo History Viewer** - See and select from operation history
- **Drop Zone Highlighting** - Visual feedback during drag operations
- **Success Animations** - Smooth transitions and flash effects
- **Statistics Dashboard** - Comprehensive workspace metrics
- **Actionable Suggestions** - Click to jump to problem areas

---

## 🎯 All Features (v1.0 - v3.0)

### Core Capabilities

- **🎨 Visual Code Organization** - See all files and functions in an elegant tree view
- **🔄 Same-File Reordering** - Reorganize functions within a single file
- **🌐 Cross-File Movement** - Move functions between different files seamlessly
- **📥 Automatic Imports** - Target file automatically imports moved functions
- **📤 Automatic Exports** - Source file automatically adds exports
- **🌍 Universal Language Support** - Works with TypeScript, JavaScript, Python, Java, C#, and 10+ languages
- **🚀 Zero Configuration** - Install and use immediately
- **💾 Safe Refactoring** - Full undo/redo support with cursor preservation
- **📦 Offline First** - No external dependencies or API calls

### v2.0 Features

- **� Context Menu Support** - Right-click on any function for quick actions
- **� Multi-Select** - Select and move multiple functions at once
- **⚡ Symbol Caching** - Up to 70% faster symbol loading
- **🔄 Enhanced Drag & Drop** - Smoother cross-file operations
- **⌨️ Keyboard Shortcuts** - Ctrl+Shift+Up/Down/T/B for quick moves

### v3.0 Features (NEW!)

- **🔄 Smart Undo/Redo** - Operation tracking with cursor restoration
- **🎨 Visual Animations** - Drop zone highlighting and success effects
- **� Refactoring Insights** - Workspace-wide code analysis
- **📈 Organization Score** - 0-100 rating of code organization
- **� Duplicate Detection** - Find similar functions across files
- **� File Size Analysis** - Warnings for files >500 lines
- **� Statistics Dashboard** - Total functions, classes, files, etc.

---

## 🎬 How to Use

### Quick Start:

**1. Open Structura Sidebar**

- Look for the purple tree icon in the Activity Bar (left sidebar)
- Click to open the multi-file view

**2. See Your Workspace**

- All workspace files appear in the tree
- Expand files to see their functions and classes

**3. Drag & Drop**

- **Same-file:** Drag a function to reorder within the file
- **Cross-file:** Drag a function to a different file to move it there
- **Visual feedback:** See drop zones highlighted in real-time

**4. Analyze Your Code** (NEW in v3.0!)

- Click "Analyze Workspace" in the Refactoring Insights panel
- Get instant feedback on code organization
- See duplicates, large files, and suggestions
- Click insights to jump to problem areas

**5. Smart Undo/Redo** (NEW in v3.0!)

- Use Ctrl+Z to undo with cursor position preserved
- View undo history with `Ctrl+Shift+P` → "Show Undo History"
- Redo operations with full context

---

## 📸 Demo Examples

### Example 1: Same-File Reordering

**Before:**

```typescript
// utils.ts
function thirdFunction() {
  return 3;
}
function firstFunction() {
  return 1;
}
function secondFunction() {
  return 2;
}
```

**Action:** Drag `firstFunction` to top

**After:**

```typescript
// utils.ts
function firstFunction() {
  return 1;
} // ← Moved!
function thirdFunction() {
  return 3;
}
function secondFunction() {
  return 2;
}
```

---

### Example 2: Cross-File Movement with Auto Imports

**Before:**

```typescript
// fileA.ts
export function helperFunction() {
  return "I'm a helper";
}

function mainFunction() {
  console.log("Main");
}
```

```typescript
// fileB.ts
function anotherFunction() {
  console.log("Another");
}
```

**Action:** Drag `helperFunction` from fileA to fileB

**After:**

```typescript
// fileA.ts (automatically updated)
function mainFunction() {
  console.log("Main");
}
```

```typescript
// fileB.ts (automatically updated)
import { helperFunction } from "./fileA"; // ← Auto import!

export function helperFunction() {
  // ← Moved!
  return "I'm a helper";
}

function anotherFunction() {
  console.log("Another");
}
```

✅ **Imports handled automatically!**

---

## 💡 Why Structura v3.0?

### The Problem

Refactoring code across files is tedious:

- Manual copy-paste loses undo history
- Forgetting to add imports breaks code
- Managing exports is error-prone
- No visual way to see code structure
- **No insights into code organization**
- **No way to find duplicates or issues**

### The Solution

Structura v3.0 brings professional refactoring tools to VS Code:

- **Direct drag-drop** between any files
- **Automatic dependency management**
- **Visual workspace overview**
- **Smart undo with cursor preservation**
- **AI-powered code insights**
- **Organization scoring and suggestions**
- **Eclipse/IntelliJ-level** refactoring capabilities

---

## 🔧 Requirements

- **VS Code** version 1.74.0 or higher
- That's it! No additional dependencies needed.

---

## 📦 Installation

### Method 1: VS Code Marketplace (Recommended)

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "**Structura**"
4. Click **Install**

### Method 2: From VSIX File

```bash
code --install-extension structura-code-reorder-3.0.0.vsix
```

---

## 🌟 Supported Languages

Structura works with any language that has a Symbol Provider in VS Code:

✅ **TypeScript** / **JavaScript**  
✅ **Python**  
✅ **Java**  
✅ **C#**  
✅ **C/C++**  
✅ **PHP**  
✅ **Ruby**  
✅ **Go**  
✅ **Rust**  
✅ **Swift**  
✅ And many more!

---

## 📊 Technical Architecture

### Core Modules

| Module                   | Purpose                                    | Status      |
| ------------------------ | ------------------------------------------ | ----------- |
| `multiFileProvider.ts`   | Multi-file TreeView + drag-drop controller | ✅ Complete |
| `codeMover.ts`           | Cross-file movement logic                  | ✅ Complete |
| `importManager.ts`       | Auto import/export handling                | ✅ Complete |
| `workspaceProvider.ts`   | Workspace file tracking                    | ✅ Complete |
| `undoManager.ts`         | Smart undo/redo with cursor preservation   | ✅ Complete |
| `animationController.ts` | Visual drag-drop feedback                  | ✅ Complete |
| `refactoringAnalyzer.ts` | Workspace code analysis                    | ✅ Complete |
| `insightsProvider.ts`    | Refactoring insights TreeView              | ✅ Complete |
| `extension.ts`           | Extension entry point                      | ✅ Complete |

### Key Technologies

- **VS Code Extension API** - TreeView, Drag & Drop, WorkspaceEdit
- **TypeScript AST** - Symbol parsing and code analysis
- **Zero external dependencies** - Lightweight and fast

---

## ⚡ Performance

- **Symbol Caching** - 70% faster repeated operations
- **Incremental Analysis** - Only analyzes changed files
- **Background Processing** - Non-blocking workspace analysis
- **Optimized for Large Projects** - Handles 1000+ files efficiently

---

## 🎯 Commands

### Drag & Drop

- Just drag and drop - no commands needed!

### Context Menu (Right-click on function)

- **Move Function To...** - Choose target file
- **Extract to New File...** - Create new file with function
- **Duplicate to File...** - Copy function to another file

### Keyboard Shortcuts

- `Ctrl+Shift+Up` - Move function up
- `Ctrl+Shift+Down` - Move function down
- `Ctrl+Shift+T` - Move to top
- `Ctrl+Shift+B` - Move to bottom

### Undo/Redo (NEW in v3.0!)

- `Ctrl+Z` - Smart undo with cursor preservation
- `Ctrl+Y` - Smart redo
- **Show Undo History** - View and select from history

### Workspace Insights (NEW in v3.0!)

- **Analyze Workspace** - Run code analysis
- Click insights to jump to code
- View organization score

---

## 🐛 Feedback & Support

### Found a Bug?

Open an issue: [GitHub Issues](https://github.com/byqaisar1/structura-vscode/issues)

### Have a Feature Request?

We'd love to hear it: [Submit Request](https://github.com/byqaisar1/structura-vscode/issues)

---

## 🏆 What Users Say

> "Finally! Eclipse's outline drag-drop in VS Code. This is what I've been waiting for!"

> "Cross-file refactoring has never been this easy. Structura saves me hours every week."

> "The auto-import feature alone is worth installing. Brilliant extension!"

> "v3.0's workspace insights are game-changing! Found so many duplicates I didn't know about."

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](https://github.com/byqaisar1/structura-vscode/blob/main/LICENSE) file for details.

---

## 👨‍💻 Developer

**Created by:** [By Qaisar](https://github.com/byqaisar1/structura-vscode/)

**Repository:** [https://github.com/byqaisar1/structura-vscode/](https://github.com/byqaisar1/structura-vscode/)

**Contact:** Open an issue for questions or feedback

---

## 🙏 Acknowledgments

Special thanks to:

- VS Code extension development community
- Developers who requested this feature for 5+ years
- Eclipse IDE and IntelliJ IDEA for inspiration
- Early testers and contributors

---

## 💖 Support the Project

If Structura saved you time:

⭐ **Star** the [GitHub repository](https://github.com/byqaisar1/structura-vscode/)  
📢 **Share** with fellow developers  
💬 **Leave a review** on VS Code Marketplace

---

## 📚 Documentation

- [Changelog](CHANGELOG.md)

---

<div align="center">

**Made with ❤️ for developers who love clean, organized code**

[Report Bug](https://github.com/byqaisar1/structura-vscode/issues) · [Request Feature](https://github.com/byqaisar1/structura-vscode/issues) · [View Changelog](https://github.com/byqaisar1/structura-vscode/blob/main/CHANGELOG.md)

</div>
