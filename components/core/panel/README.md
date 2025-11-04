# Enhanced Panel Component

A feature-rich, draggable, resizable panel component with animations and theme support.

## Features

- 🎯 Draggable header
- 📐 Resizable from corner
- 🎨 Theme support (light/dark)
- ✨ Smooth animations
- 📦 Collapsible content
- 🔳 Minimize/Maximize
- 🎛️ Event callbacks
- 📱 Responsive design
- ♿ Accessibility support

## Usage

### Basic Panel

```javascript
// Create a simple panel
const panel = BMS.UI.Components.Panel.create({
    title: 'My Panel',
    content: '<p>Hello World!</p>'
});
```

### Advanced Configuration

```javascript
const panel = BMS.UI.Components.Panel.create({
    id: 'custom-panel',
    title: 'Advanced Panel',
    content: document.getElementById('my-content'),
    position: { top: 100, left: 200 },
    size: { width: 500, height: 400 },
    draggable: true,
    resizable: true,
    collapsible: true,
    minimizable: true,
    maximizable: true,
    closeable: true,
    animation: true,
    theme: 'dark',
    className: 'my-custom-class',
    zIndex: 10001,

    // Event callbacks
    onClose: (panel) => console.log('Panel closed'),
    onMinimize: (panel) => console.log('Panel minimized'),
    onMaximize: (panel) => console.log('Panel maximized'),
    onCollapse: (panel) => console.log('Panel collapsed'),
    onResize: (panel, size) => console.log('Panel resized:', size),
    onDrag: (panel, position) => console.log('Panel moved:', position)
});
```

## API Reference

### Methods

#### `create(options)`
Creates a new panel with the specified options.

**Parameters:**
- `options` (Object): Configuration object
  - `id` (String): Panel ID (auto-generated if not provided)
  - `title` (String): Panel title
  - `content` (String|HTMLElement): Panel content
  - `position` (Object): Initial position `{top, left}`
  - `size` (Object): Initial size `{width, height}`
  - `draggable` (Boolean): Enable dragging (default: true)
  - `resizable` (Boolean): Enable resizing (default: true)
  - `collapsible` (Boolean): Enable collapse (default: true)
  - `minimizable` (Boolean): Show minimize button (default: true)
  - `maximizable` (Boolean): Show maximize button (default: true)
  - `closeable` (Boolean): Show close button (default: true)
  - `animation` (Boolean): Enable animations (default: true)
  - `theme` (String): Theme name ('light' or 'dark')
  - `className` (String): Additional CSS classes
  - `zIndex` (Number): Z-index value (default: 10000)
  - `onClose` (Function): Close callback
  - `onMinimize` (Function): Minimize callback
  - `onMaximize` (Function): Maximize callback
  - `onCollapse` (Function): Collapse callback
  - `onResize` (Function): Resize callback
  - `onDrag` (Function): Drag callback

**Returns:** HTMLElement - The panel element

#### `updateContent(panel, content)`
Updates the content of an existing panel.

```javascript
BMS.UI.Components.Panel.updateContent(panel, '<p>New content</p>');
```

#### `minimize(panel)`
Toggles the minimized state of a panel.

```javascript
BMS.UI.Components.Panel.minimize(panel);
```

#### `maximize(panel)`
Toggles the maximized state of a panel.

```javascript
BMS.UI.Components.Panel.maximize(panel);
```

#### `toggleCollapse(panel)`
Toggles the collapsed state of a panel.

```javascript
BMS.UI.Components.Panel.toggleCollapse(panel);
```

#### `bringToFront(panel)`
Brings a panel to the front (highest z-index).

```javascript
BMS.UI.Components.Panel.bringToFront(panel);
```

#### `destroy(panel)`
Removes a panel from the DOM with animation.

```javascript
BMS.UI.Components.Panel.destroy(panel);
```

## Examples

### Dynamic Content Update

```javascript
const panel = BMS.UI.Components.Panel.create({
    title: 'Dynamic Panel',
    content: '<div id="panel-content">Loading...</div>'
});

// Update content after data loads
fetch('/api/data')
    .then(response => response.json())
    .then(data => {
        const content = `
            <h3>${data.title}</h3>
            <p>${data.description}</p>
        `;
        BMS.UI.Components.Panel.updateContent(panel, content);
    });
```

### Multiple Panels Management

```javascript
const panels = [];

// Create multiple panels
for (let i = 0; i < 3; i++) {
    const panel = BMS.UI.Components.Panel.create({
        title: `Panel ${i + 1}`,
        content: `Content for panel ${i + 1}`,
        position: {
            top: 50 + (i * 30),
            left: 50 + (i * 30)
        }
    });
    panels.push(panel);
}

// Bring specific panel to front on click
panels.forEach(panel => {
    panel.addEventListener('mousedown', () => {
        BMS.UI.Components.Panel.bringToFront(panel);
    });
});
```

### Panel with Custom Content

```javascript
// Create content element
const content = document.createElement('div');
content.innerHTML = `
    <div style="padding: 10px;">
        <h3>Settings</h3>
        <label>
            <input type="checkbox" id="option1"> Enable notifications
        </label>
        <br>
        <label>
            <input type="checkbox" id="option2"> Dark mode
        </label>
        <br>
        <button onclick="saveSettings()">Save</button>
    </div>
`;

// Create panel with custom content
const settingsPanel = BMS.UI.Components.Panel.create({
    title: 'Settings',
    content: content,
    size: { width: 300, height: 200 },
    resizable: false,
    onClose: () => {
        console.log('Settings panel closed');
    }
});
```

## CSS Customization

The panel component uses CSS custom properties for theming:

```css
.bms-panel-enhanced {
    --bms-panel-bg: #ffffff;
    --bms-panel-border: #e0e0e0;
    --bms-panel-header-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --bms-panel-header-color: #ffffff;
    --bms-panel-content-bg: #ffffff;
    --bms-panel-footer-bg: #f5f5f5;
    --bms-panel-resizer-color: #999;
}
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

Requires the core BMS library to be loaded first:
- `bookmarklet-suite.js`
- `bookmarklet-suite.css`