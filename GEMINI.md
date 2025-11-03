# GEMINI.md - Bookmarklet Suite

## Project Overview

This project is a JavaScript suite for creating powerful and consistent bookmarklets. The suite provides a library of UI components and utility functions that can be used to build complex bookmarklets with a minimal amount of code.

The core of the project is the `bookmarklet-suite.js` file, which contains the `BMS` (Bookmarklet Suite) namespace. This namespace exposes a number of modules for creating UI elements (`BMS.UI`), interacting with the DOM (`BMS.DOM`), and performing common utility tasks (`BMS.Utils`).

The suite is styled using the `bookmarklet-suite.css` file, which provides a clean and modern look and feel. The styles are scoped to the `.bms-container` class to avoid conflicts with the host page's styles.

The project also includes several refactored bookmarklets that demonstrate how to use the suite:

*   **HtmlAnalyser**: Detects frameworks and meta tags on the current page.
*   **JsonExtract**: Extracts JSON-LD data from the page.
*   **TwitterMediaExtractor**: Extracts images and videos from a Twitter/X page.

## Building and Running

There is no build process for this project. The suite is written in plain JavaScript and CSS.

### Running the Tests

The project includes several test files that can be used to test the functionality of the suite and the refactored bookmarklets:

*   `test.html`: A general test page for the bookmarklet suite's UI components.
*   `HtmlAnalyser-test.html`: A test page for the HtmlAnalyser bookmarklet.
*   `JsonExtract-test.html`: A test page for the JsonExtract bookmarklet.
*   `TwitterMediaExtractor-test.html`: A test page for the TwitterMediaExtractor bookmarklet.

To run the tests, simply open these HTML files in a browser.

### Using the Bookmarklets

To use the bookmarklets, you need to host the JavaScript files on a web server. The loader scripts in the `Bookmarklets/loaders` directory are already configured to use the following remote URLs:

*   `https://raw.githubusercontent.com/SOELexicon/BookmarkletIncludes/refs/heads/main/JavaScript/bookmarklet-suite.js`
*   `https://raw.githubusercontent.com/SOELexicon/BookmarkletIncludes/refs/heads/main/JavaScript/HtmlAnalyser-refactored.js`
*   `https://raw.githubusercontent.com/SOELexicon/BookmarkletIncludes/refs/heads/main/JavaScript/JsonExtract-refactored.js`
*   `https://raw.githubusercontent.com/SOELexicon/BookmarkletIncludes/refs/heads/main/JavaScript/TwitterMediaExtractor-refactored.js`

Once the files are hosted, you can create a new bookmarklet in your browser and paste the content of the desired loader script (e.g., `Bookmarklets/loaders/HtmlAnalyser-loader.js`) into the URL field.

## Development Conventions

*   **Namespace:** All suite functions are under the `BMS` global namespace to avoid conflicts.
*   **UI Components:** UI components are created using the functions in the `BMS.UI` object (e.g., `BMS.UI.createPanel`, `BMS.UI.createModal`).
*   **CSS:** All CSS classes are prefixed with `bms-` to prevent conflicts with the host page's styles.
*   **Private Functions:** Private functions within the suite are prefixed with an underscore (e.g., `_makeDraggable`).
*   **Testing:** Each new feature should be accompanied by a demonstration in the `test.html` file. Each new bookmarklet should have its own test file.
