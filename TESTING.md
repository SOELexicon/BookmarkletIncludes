# Testing Bookmarklets

## Quick Start

⚠️ **DO NOT test on GitHub.com** - it blocks all bookmarklets by design.

### Method 1: Local HTML Files (Easiest)

1. Double-click any of these files to open in your browser:
   - `HtmlAnalyser-test.html`
   - `JsonExtract-test.html`
   - `TwitterMediaExtractor-test.html`

2. The bookmarklet will load automatically and display the UI

### Method 2: Real Bookmarklet Testing (Recommended)

**Step 1: Create the bookmarklet**

1. Show your bookmarks bar:
   - Chrome/Edge: `Ctrl+Shift+B`
   - Firefox: `Ctrl+Shift+B`

2. Right-click the bookmarks bar → "Add page" or "New bookmark"

3. Fill in:
   - **Name:** `HTML Analyser`
   - **URL:** Copy the entire contents of `Bookmarklets/loaders/HtmlAnalyser-loader.js`

**Step 2: Test on a compatible website**

Go to one of these sites:
- https://en.wikipedia.org/wiki/JavaScript
- https://twitter.com
- https://www.reddit.com
- https://www.youtube.com

**Step 3: Click the bookmarklet**

Click "HTML Analyser" in your bookmarks bar. A dark-themed panel should appear!

## What Each Bookmarklet Does

### HTML Analyser
- Detects JavaScript frameworks (React, Vue, Angular, etc.)
- Shows meta tags (Open Graph, Twitter Card)
- Displays page info (title, description, canonical URL)
- Shows detected technologies

### JSON Extract
- Extracts JSON-LD structured data
- Shows Open Graph meta tags
- Displays Twitter Card data
- Shows Microdata (schema.org)
- Export all data as JSON

### Twitter Media Extractor
- Extracts images and videos from Twitter/X posts
- Shows media with download buttons
- Displays media metadata
- Allows bulk download

## Troubleshooting

### Error: "Failed to load bookmarklet"
**Cause:** The website has strict Content Security Policy (CSP)

**Solution:** Test on a different website from the compatible list above

### Error: "BMS not loaded"
**Cause:** The bookmarklet suite didn't initialize

**Solution:**
1. Open browser console (F12)
2. Look for errors
3. Try refreshing the page and running the bookmarklet again

### Nothing happens when I click
**Cause:** Bookmarklet code might not be copied correctly

**Solution:**
1. Delete the bookmark
2. Re-create it, making sure to copy the ENTIRE line from the loader file
3. The URL should start with `javascript:(async function(){`

## Compatible vs Incompatible Sites

### ✅ Works on (90%+ of websites)
- Social media (Twitter, Reddit, LinkedIn)
- News sites (CNN, BBC, NY Times)
- Wikipedia
- YouTube
- E-commerce (Amazon, eBay - though some sections may block)
- Personal blogs and websites
- Documentation sites (MDN, Stack Overflow)

### ❌ Does NOT work on
- GitHub.com
- Banking websites
- Some government sites (.gov)
- Enterprise apps with strict security
- Sites with CSP header: `script-src ... (without 'unsafe-inline')`

## Testing Checklist

When testing a new bookmarklet:

- [ ] Test on local HTML file first
- [ ] Create bookmarklet in browser
- [ ] Test on Wikipedia (always works)
- [ ] Test on Twitter/X (if relevant)
- [ ] Check console for errors (F12)
- [ ] Verify UI appears and is functional
- [ ] Test drag/resize functionality
- [ ] Test all buttons and actions
- [ ] Verify data extraction is correct
- [ ] Test on mobile browser (if applicable)

## Development Testing

When developing new features:

1. Make changes to `JavaScript/*-refactored.js`
2. Test locally by opening `*-test.html`
3. Commit and push to GitHub main branch
4. Wait 30 seconds for GitHub CDN to update
5. Test the actual bookmarklet on Wikipedia
6. If it works on Wikipedia, it will work on most sites

## FAQ

**Q: Why doesn't it work on GitHub?**
A: GitHub's Content Security Policy blocks ALL forms of dynamic JavaScript execution for security. This is intentional and cannot be bypassed.

**Q: Can I make it work on banking sites?**
A: No. Banking sites intentionally block bookmarklets to prevent security vulnerabilities.

**Q: The UI looks broken or unstyled**
A: The CSS might not have loaded. Check the console for network errors. Try refreshing and running again.

**Q: How do I debug errors?**
A: Press F12 to open browser console. Look for red error messages. Most issues are CSP-related.
