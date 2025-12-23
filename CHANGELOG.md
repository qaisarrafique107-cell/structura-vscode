# Changelog

All notable changes to the "Structura" extension will be documented in this file.

---

## [1.1.0] - 2025-12-24

### 🚀 Update: Context Menu & Multi-Select

#### ✨ New Features

- **🎯 Context Menu Support** - Right-click on any function for quick actions
- **🔗 Multi-Select** - Select and move multiple functions at once
- **⚡ Performance Boost** - Up to 70% faster symbol loading
- **🔄 Enhanced Drag & Drop** - Smoother cross-file operations

#### 🛠 Technical Improvements

- **Symbol Caching** - Added TTL-based caching for faster symbol loading
- **Improved Error Handling** - More descriptive error messages
- **Better TypeScript Support** - Enhanced type checking and inference
- **Memory Optimization** - Reduced memory usage during large operations

#### 🐛 Bug Fixes

- Fixed import path resolution in Windows environments
- Resolved symbol duplication issues
- Improved error recovery during file operations
- Fixed context menu visibility conditions

#### 📦 Build & Dependencies

- Updated package dependencies
- Improved build process
- Added proper TypeScript configuration
- Enhanced development tooling

---

## [1.0.0] - 2025-12-23


### 🎉 Initial Release

This is the first public release of Structura, bringing professional-grade code refactoring to VS Code.

### ✨ Added

#### Core Features

- **Multi-File TreeView** - Complete workspace view showing all files and their functions
- **Cross-File Drag & Drop** - Move functions directly between any files with drag-drop
- **Automatic Import Management** - Target files automatically import moved functions
- **Automatic Export Management** - Source files automatically add necessary exports
- **Same-File Reordering** - Reorganize functions within a single file (improved from v0.5.0)

#### Technical Improvements

- **New Module: `multiFileProvider.ts`** - Handles multi-file tree view and drag-drop
- **New Module: `codeMover.ts`** - Cross-file movement logic with dependency tracking
- **New Module: `importManager.ts`** - Intelligent import/export statement handling
- **New Module: `workspaceProvider.ts`** - Workspace file system monitoring
- **Enhanced Extension Entry Point** - Cleaner command registration and lifecycle management

#### User Experience

- Visual feedback during drag operations
- Instant code movement without command palette
- Preserved code formatting and spacing
- Full undo/redo support (Ctrl+Z)

### 🔄 Changed

- **Drag-Drop System** - Completely rewritten for cross-file support
- **TreeView Architecture** - Migrated from single-file to workspace-wide view
- **Import Resolution** - Now handles relative paths and module resolution automatically
- **Performance** - Optimized for larger workspaces

### ⚠️ Deprecated

- **Command Palette Movement** - Direct drag-drop replaces old command-based approach
- **Keyboard Shortcuts** - Removed in favor of intuitive drag-drop (may return in v1.1)

### 🗑️ Removed

- Old single-file provider implementation
- Unused command palette commands
- Deprecated keyboard shortcut bindings
- Legacy demo files (DEMO_GUIDE.md - replaced with comprehensive README)

### 🐛 Fixed

- Fixed whitespace handling during cross-file moves
- Fixed import statement duplication issues
- Fixed positioning bugs when moving functions between files
- Fixed tree refresh issues after file modifications
- Fixed drag-drop target highlighting

### 📦 Build & Packaging

- Package size: ~22 KB (optimized)
- Clean build with only required files
- Removed development artifacts
- Updated extension manifest with v1.0.0 metadata

---

## [0.5.0] - 2025-12-17

### 🚧 Pre-Release - Foundation Work

### Added

- Basic cross-file movement using command palette
- Initial import management prototype
- Multi-file workspace scanning
- Command-based function movement

### Changed

- Refactored provider architecture
- Enhanced symbol detection

### Known Issues

- Commands were cumbersome (required multiple steps)
- Manual import management needed
- No visual feedback during operations

---

## [0.0.1] - 2025-12-16

### 🎯 Initial Release - Same-File MVP

### Added

- **Same-File Drag & Drop** - Reorder functions within a single file
- **Basic TreeView** - Show functions and classes in sidebar
- **Symbol Detection** - Parse TypeScript, JavaScript, Python, Java
- **Basic Icons** - Function, class, and method icons
- **Undo Support** - Full undo/redo with Ctrl+Z

### Features

- Drag-drop function reordering
- Class method reordering
- Multi-language support (10+ languages)
- Zero external dependencies
- Offline operation

### Limitations

- Only worked within single file
- No cross-file movement
- No automatic import handling
- Basic whitespace preservation

---

## Version Comparison Table

| Feature              | v0.0.1    | v0.5.0      | v1.0.0         |
| -------------------- | --------- | ----------- | -------------- |
| Same-file reordering | ✅        | ✅          | ✅             |
| Multi-file view      | ❌        | 🔶 Partial  | ✅             |
| Cross-file movement  | ❌        | 🔶 Commands | ✅ Direct drag |
| Auto imports         | ❌        | 🔶 Manual   | ✅ Automatic   |
| Auto exports         | ❌        | ❌          | ✅ Automatic   |
| Keyboard shortcuts   | ❌        | ✅          | ⚠️ Deprecated  |
| Drag-drop UX         | ✅ Single | ✅ Limited  | ✅ Full        |

**Legend:**

- ✅ Fully supported
- 🔶 Partially supported
- ⚠️ Deprecated but functional
- ❌ Not available

---

## [Unreleased] - Future Plans

### Planned for v1.1

- Full multi-select support (drag multiple functions)
- AI-powered organization suggestions
- Context menu options
- Performance improvements for large projects

### Planned for v1.2

- Keyboard shortcuts (Ctrl+Shift+Up/Down)
- Custom drag animations
- Workspace-wide refactoring insights
- Batch operations

### Under Consideration

- Git integration (track moved functions)
- Code smell detection
- Automatic code organization
- Team collaboration features

---

## Breaking Changes

### v1.0.0

- **Command palette approach removed** - Use direct drag-drop instead
- **Keyboard shortcuts deprecated** - May return in future version
- **TreeView structure changed** - Now shows all workspace files

---

## Migration Guide

### From v0.5.0 to v1.0.0

**What Changed:**

- Commands removed - use drag-drop
- TreeView now shows all files
- Auto import/export now automatic

**How to Migrate:**

1. Update to v1.0.0
2. Open Structura sidebar
3. Use drag-drop instead of commands
4. Imports now handled automatically!

### From v0.0.1 to v1.0.0

**Major Changes:**

- Cross-file movement now available
- Multi-file workspace view
- Auto dependency management

**How to Upgrade:**

1. Install v1.0.0
2. Explore multi-file TreeView
3. Try cross-file drag-drop
4. Enjoy automatic imports!

---

## Known Issues

### Current (v1.0.0)

- Multi-select foundation exists but not fully wired
- Large files (1000+ lines) may have performance impact
- Format Document recommended after large moves

### Tracking

All issues tracked at: https://github.com/byqaisar1/structura-vscode/issues

---

## Contributors

### v1.0.0

- **By Qaisar** - Lead developer, architecture, implementation

### Special Thanks

- VS Code extension community
- Early testers and feedback providers
- Eclipse/IntelliJ teams for inspiration

---

## Links

- **GitHub Repository:** https://github.com/byqaisar1/structura-vscode/
- **VS Code Marketplace:** https://marketplace.visualstudio.com/items?itemName=structura-dev.structura-code-reorder
- **Issue Tracker:** https://github.com/byqaisar1/structura-vscode/issues
- **Documentation:** [README.md](https://github.com/byqaisar1/structura-vscode/blob/main/README.md)

---

<div align="center">

**Structura v1.0.0** - The Cross-File Refactoring Release

_Made with ❤️ for developers_

</div>
