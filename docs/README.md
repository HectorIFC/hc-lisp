# HC-Lisp Website

This directory contains the static website for HC-Lisp, hosted on GitHub Pages.

## Local Development

To run the website locally:

1. Open `index.html` in your browser, or
2. Use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   ```

## Files

- `index.html` - Main website page
- `styles.css` - CSS styles and theme
- `script.js` - JavaScript for interactivity
- `_config.yml` - Jekyll configuration for GitHub Pages

## GitHub Pages Configuration

The website is automatically deployed to GitHub Pages from the `docs/` folder. 

To enable GitHub Pages:
1. Go to your repository settings
2. Navigate to "Pages" section
3. Select "Deploy from a branch"
4. Choose `main` branch and `/docs` folder
5. Save

The site will be available at: `https://hectorifc.github.io/hc-lisp`

## Features

- **Modern Design**: Clean, professional look with dark theme
- **Responsive**: Works on desktop, tablet, and mobile
- **Interactive**: Smooth scrolling, animations, and hover effects
- **Code Examples**: Syntax-highlighted HC-Lisp code samples
- **Terminal Demo**: Animated REPL simulation
- **Performance**: Optimized loading and minimal dependencies
