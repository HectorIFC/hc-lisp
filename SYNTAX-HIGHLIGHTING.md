# VS Code Configuration for HC-Lisp

## Syntax Highlighting

To get proper syntax highlighting for `.hclisp` files in VS Code:

### Method 1: Automatic Configuration (Recommended)

1. The "Lisp" extension has been automatically installed in the workspace
2. Settings in `.vscode/settings.json` already associate `.hclisp` files with the Lisp language
3. Restart VS Code or reload the window (`Ctrl+Shift+P` → "Developer: Reload Window")

### Method 2: Manual Configuration

1. Open a `.hclisp` file
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "Change Language Mode" and select the option
4. Type "Lisp" and select

### Method 3: Configuration Via Status Bar

1. Open a `.hclisp` file
2. Click the language indicator in the status bar (bottom right corner)
3. Select "Lisp" from the language list

## Editing Features

With syntax highlighting configured, you'll have:

- **Colors for different elements**:
  - Comments (`;; text`) in green/gray
  - Strings (`"text"`) in red/orange
  - Keywords (`:keyword`) in purple/blue
  - Numbers (`123`, `45.67`, `1e-10`) in blue
  - Colored parentheses for easy visualization

- **Automatic indentation** configured for 2 spaces
- **Matching parentheses highlighting**
- **Visual guides for parentheses**

## Demonstration File

Open the `demo-syntax.hclisp` file to see examples of how syntax highlighting should appear.

## Recommended Extensions

Besides the "Lisp" extension already installed, consider installing:

- **Bracket Pair Colorizer** (already enabled in settings)
- **Rainbow Brackets** for better visualization of nested parentheses
- **Calva** if you want more advanced features similar to Clojure

## Troubleshooting

If syntax highlighting is not working:

1. Check if the "Lisp" extension is installed
2. Reload VS Code
3. Try manually changing the language to "Lisp"
4. Verify that the `.vscode/settings.json` file contains the correct settings

## Custom Settings

You can customize colors by editing your VS Code theme or using `editor.tokenColorCustomizations` settings in your personal `settings.json`.
