# Project: Bookmarklet Suite

## 1. Goal

To create a reusable JavaScript and CSS library that will simplify the creation and reduce the file size of bookmarklets. This suite will provide a common set of functions and styles for building user interfaces, interacting with the DOM, and performing other common tasks.

## 2. Core Components

The suite will consist of two main files:

*   `JavaScript/bookmarklet-suite.js`: A library of common JavaScript functions.
*   `CSS/bookmarklet-suite.css`: A stylesheet with a set of utility classes for styling bookmarklet UIs.

A loader script will be provided to inject these files into the target page.

## 3. JavaScript Library (`bookmarklet-suite.js`)

The JavaScript library will be organized under a single global namespace, `BMS` (Bookmarklet Suite), to prevent conflicts with the host page's scripts.

### 3.1. Namespace and Initialization

```javascript
window.BMS = {
  config: {
    cssUrl: 'URL_TO_YOUR/CSS/bookmarklet-suite.css',
    // Other config options
  },
  init: function(options) {
    // Merge user options with default config
    this.config = { ...this.config, ...options };
    this.injectCSS();
    // Other initialization tasks
  },
  // ... other functions
};
```

### 3.2. Core Functions

#### 3.2.1. `BMS.injectCSS()`

Injects the `bookmarklet-suite.css` file into the page's `<head>`.

#### 3.2.2. UI Functions (`BMS.UI`)

A collection of functions for creating and managing UI elements.

*   `BMS.UI.createPanel({ id, title, content, footer })`: Creates a draggable, resizable, and minimizable panel.
*   `BMS.UI.createModal({ id, title, content })`: Creates a modal dialog.
*   `BMS.UI.createButton({ text, onClick, primary = false })`: Creates a styled button.
*   `BMS.UI.updateStatus(message, level = 'info')`: Shows a status message (info, success, warning, error).
*   `BMS.UI.showSpinner()` / `BMS.UI.hideSpinner()`: Shows/hides a loading spinner.

#### 3.2.3. DOM Functions (`BMS.DOM`)

Wrapper functions for common DOM operations.

*   `BMS.DOM.select(selector)`: A robust `querySelector`.
*   `BMS.DOM.selectAll(selector)`: A robust `querySelectorAll`.
*   `BMS.DOM.addClass(element, className)`
*   `BMS.DOM.removeClass(element, className)`
*   `BMS.DOM.toggleClass(element, className)`
*   `BMS.DOM.setHTML(element, html)`: Safely sets innerHTML.

#### 3.2.4. Utility Functions (`BMS.Utils`)

A collection of helper functions.

*   `BMS.Utils.log(message, level = 'info')`: A namespaced console logger.
*   `BMS.Utils.throttle(func, delay)`: For rate-limiting function calls.
*   `BMS.Utils.debounce(func, delay)`: For delaying function execution.
*   `BMS.Utils.generateId(prefix = 'bms-')`: Generates a unique ID.
*   `BMS.Utils.copyToClipboard(text)`: Copies text to the clipboard.

## 4. CSS Library (`bookmarklet-suite.css`)

The CSS library will be designed to be non-intrusive and conflict-resistant. All class names will be prefixed with `bms-`.

### 4.1. Reset and Base Styles

A simple reset will be applied to all `bms-` prefixed elements to ensure a consistent appearance across different websites.

### 4.2. Component Classes

*   `.bms-panel`: The main container for panels.
*   `.bms-panel-header`, `.bms-panel-content`, `.bms-panel-footer`.
*   `.bms-modal`, `.bms-modal-overlay`, `.bms-modal-content`.
*   `.bms-button`, `.bms-button-primary`.
*   `.bms-status-bar`, `.bms-status-info`, `.bms-status-success`, etc.
*   `.bms-spinner`.

### 4.3. Theme

A default light and dark theme will be provided, which can be toggled by adding a `.bms-dark-theme` class to the main UI container.

### 4.4. Utility Classes

A set of utility classes for spacing, layout, and typography, similar to Tailwind CSS but with the `bms-` prefix.

*   `.bms-p-1`, `.bms-m-1` (padding, margin)
*   `.bms-flex`, `.bms-grid`
*   `.bms-text-center`, `.bms-text-bold`

## 5. Implementation Steps

1.  **Develop `bookmarklet-suite.css`**:
    *   Create the base styles and reset.
    *   Style the UI components (panel, modal, button, etc.).
    *   Implement the light and dark themes.
    *   Add utility classes.

2.  **Develop `bookmarklet-suite.js`**:
    *   Set up the `BMS` namespace and `init` function.
    *   Implement the `injectCSS` function.
    *   Build the `BMS.UI` functions, starting with the panel.
    *   Build the `BMS.DOM` and `BMS.Utils` helper functions.

3.  **Create a Loader Script**:
    *   Develop a small, minified loader script that can be used as the bookmarklet itself. This script will be responsible for loading `bookmarklet-suite.js`.

4.  **Refactor Existing Bookmarklets**:
    *   Update `HtmlAnalyser.js` and `JsonExtract.js` to use the new suite. This will serve as a proof of concept and help refine the library.

5.  **Documentation**:
    *   Create detailed documentation for each function and CSS class, with examples. This `Bookmarklets.md` file will be the start of that.

## 6. Example: "Hello World" Bookmarklet

The final bookmarklet code would look something like this:

```javascript
javascript:(function(){
  const SCRIPT_URL = 'URL_TO_YOUR/JavaScript/bookmarklet-suite.js';
  const script = document.createElement('script');
  script.src = SCRIPT_URL;
  script.onload = () => {
    BMS.init();
    BMS.UI.createPanel({
      id: 'hello-world-panel',
      title: 'Hello World',
      content: '<p>This is a panel created by the Bookmarklet Suite!</p>'
    });
  };
  document.head.appendChild(script);
})();
```

This plan provides a clear path forward for creating a powerful and maintainable bookmarklet suite.
