# BMS Components Library

A comprehensive collection of world-class UI/UX components for the Bookmarklet Suite (BMS) framework. All components feature dark theme by default, smooth animations, and sophisticated interactions.

## 🎨 Design Philosophy

- **Dark Theme First**: All components use dark theme by default for reduced eye strain
- **Smooth Animations**: Sophisticated transitions and effects with `prefers-reduced-motion` support
- **Modular Architecture**: Each component works independently or can be composed together
- **Zero Dependencies**: Pure JavaScript and CSS, no external libraries required
- **Accessibility**: ARIA attributes, keyboard navigation, and screen reader support

## 📦 Component Categories

### Core Components
Foundation components that other components build upon.

| Component | Description | Status |
|-----------|-------------|---------|
| **Panel** | Draggable, resizable panels with animations | ✅ Complete |
| **Modal** | Overlay dialogs with multiple variants | ✅ Complete |
| **Theme** | Dynamic theme switching system | 🚧 Planned |

### Navigation Components
Components for navigating and organizing content.

| Component | Description | Status |
|-----------|-------------|---------|
| **Tabs** | Horizontal/vertical tabbed interfaces | 🚧 Planned |
| **Breadcrumbs** | Navigation path indicators | 🚧 Planned |
| **Menu** | Dropdown and context menus | 🚧 Planned |
| **Pagination** | Page navigation controls | 🚧 Planned |
| **Navbar** | Top navigation bars | 🚧 Planned |

### Data Display Components
Components for presenting data in various formats.

| Component | Description | Status |
|-----------|-------------|---------|
| **Table** | Advanced data tables with sorting, filtering, pagination | ✅ Complete |
| **List** | Simple and virtual scrolling lists | 🚧 Planned |
| **Tree** | Hierarchical tree views | 🚧 Planned |
| **Card** | Content container cards | 🚧 Planned |
| **Badge** | Status indicators and labels | 🚧 Planned |
| **Code Block** | Syntax highlighted code display | 🚧 Planned |

### Form Components
Input and form control components.

| Component | Description | Status |
|-----------|-------------|---------|
| **Input** | Text inputs with validation | 🚧 Planned |
| **Select** | Dropdown selectors | 🚧 Planned |
| **Checkbox** | Single and group checkboxes | 🚧 Planned |
| **Radio** | Radio button groups | 🚧 Planned |
| **Toggle** | On/off switches | 🚧 Planned |
| **Slider** | Range sliders | 🚧 Planned |
| **Form Builder** | Dynamic form generation | 🚧 Planned |

### Feedback Components
Components for user feedback and status indication.

| Component | Description | Status |
|-----------|-------------|---------|
| **Spinner** | Loading spinners with variants | 🚧 Planned |
| **Progress** | Progress bars and circles | 🚧 Planned |
| **Notification** | Toast notifications | 🚧 Planned |
| **Alert** | Inline alerts | 🚧 Planned |
| **Tooltip** | Hover tooltips | 🚧 Planned |
| **Skeleton** | Loading placeholders | 🚧 Planned |

### Interactive Components
Components with rich animations and interactions.

| Component | Description | Status |
|-----------|-------------|---------|
| **Animations** | Comprehensive animation library | ✅ Complete |
| **Accordion** | Collapsible sections | 🚧 Planned |
| **Drawer** | Slide-in panels | 🚧 Planned |
| **Popover** | Click-triggered popovers | 🚧 Planned |
| **Carousel** | Image/content carousels | 🚧 Planned |

### Utility Components
Helper components for common functionality.

| Component | Description | Status |
|-----------|-------------|---------|
| **Drag & Drop** | Draggable and sortable elements | 🚧 Planned |
| **Resizable** | Make elements resizable | 🚧 Planned |
| **Virtual Scroll** | Performance scrolling for large lists | 🚧 Planned |
| **Infinite Scroll** | Load more on scroll | 🚧 Planned |
| **Keyboard Shortcuts** | Keyboard shortcut management | 🚧 Planned |
| **Clipboard** | Enhanced clipboard operations | 🚧 Planned |

### Template Components
Pre-built component combinations for common use cases.

| Template | Description | Status |
|----------|-------------|---------|
| **Data Viewer** | Complete data viewing interface | ✅ Complete |
| **Dashboard** | Dashboard layouts | 🚧 Planned |
| **Settings Panel** | Settings interfaces | 🚧 Planned |
| **Wizard** | Multi-step forms | 🚧 Planned |
| **Media Gallery** | Image/video galleries | 🚧 Planned |

## 🚀 Quick Start

### Including Components

```javascript
// Load the BMS suite first
BMS.init();

// Then use components
const panel = BMS.UI.Components.Panel.create({
    title: 'My Panel',
    content: 'Hello World!',
    position: { top: 100, left: 100 }
});
```

### Using Templates

Templates combine multiple components for complete interfaces:

```javascript
const viewer = BMS.UI.Templates.DataViewer.create({
    title: 'User Data',
    columns: [
        { key: 'id', title: 'ID' },
        { key: 'name', title: 'Name' },
        { key: 'email', title: 'Email' }
    ],
    data: userData,
    features: {
        search: true,
        export: true,
        filters: true
    }
});
```

## 🎯 Usage Examples

### Enhanced Panel with Animations

```javascript
const panel = BMS.UI.Components.Panel.create({
    title: 'Animated Panel',
    content: '<p>Content with smooth animations</p>',
    animation: true,
    draggable: true,
    resizable: true,
    onClose: () => console.log('Panel closed')
});

// Animate panel appearance
BMS.UI.Animations.scale(panel, {
    from: 0.8,
    to: 1,
    duration: 500
});
```

### Advanced Data Table

```javascript
const table = BMS.UI.Components.Table.create({
    columns: [
        { key: 'name', title: 'Name', sortable: true },
        { key: 'value', title: 'Value', align: 'right' },
        {
            key: 'status',
            title: 'Status',
            renderer: (value) => {
                const color = value === 'active' ? 'green' : 'gray';
                return `<span style="color: ${color};">${value}</span>`;
            }
        }
    ],
    data: myData,
    sortable: true,
    filterable: true,
    searchable: true,
    paginate: true,
    pageSize: 25
});
```

### Modal Dialogs

```javascript
// Confirmation modal
BMS.UI.Components.Modal.confirm({
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmText: 'Yes, Proceed',
    cancelText: 'Cancel',
    onConfirm: () => console.log('Confirmed'),
    onCancel: () => console.log('Cancelled')
});

// Prompt modal
BMS.UI.Components.Modal.prompt({
    title: 'Enter Name',
    message: 'Please enter your name:',
    placeholder: 'John Doe',
    validation: (value) => {
        if (!value) return 'Name is required';
        if (value.length < 3) return 'Name must be at least 3 characters';
        return null;
    },
    onSubmit: (value) => console.log('Name:', value)
});
```

### Animation Effects

```javascript
// Fade in element
BMS.UI.Animations.fadeIn(element, {
    duration: 300,
    delay: 100
});

// Slide from top
BMS.UI.Animations.slide(element, 'down', {
    distance: 50,
    duration: 400
});

// Ripple effect on click
element.addEventListener('click', (e) => {
    BMS.UI.Animations.ripple(element, e, {
        color: 'rgba(102, 126, 234, 0.5)'
    });
});

// Stagger animation for multiple elements
const items = document.querySelectorAll('.item');
BMS.UI.Animations.stagger(items, 'fadeIn', {
    staggerDelay: 50,
    duration: 200
});
```

## 🎨 Theming

### Dark Theme (Default)

All components use dark theme by default with carefully chosen colors for reduced eye strain:

```css
/* Default dark theme variables */
--bms-bg: #1a1a1a;
--bms-text: #e0e0e0;
--bms-border: #2a2a2a;
--bms-primary: #667eea;
```

### Light Theme

Add the `.bms-light-theme` class to switch to light theme:

```javascript
// Apply light theme to a component
panel.classList.add('bms-light-theme');

// Or globally
document.body.classList.add('bms-light-theme');
```

### Custom Themes

Create custom themes by overriding CSS variables:

```css
.my-custom-theme {
    --bms-bg: #0a0a0a;
    --bms-text: #00ff00;
    --bms-primary: #ff00ff;
}
```

## 📊 Component Status Legend

- ✅ **Complete**: Fully implemented and tested
- 🚧 **Planned**: In the roadmap for implementation
- 🔄 **In Progress**: Currently being developed
- ⚠️ **Experimental**: Working but may change

## 🔧 Development Guidelines

### Creating New Components

1. Follow the established namespace pattern:
   ```javascript
   BMS.UI.Components.YourComponent = { ... }
   ```

2. Include dark theme by default:
   ```css
   .bms-your-component {
       background: var(--bms-bg, #1a1a1a);
       color: var(--bms-text, #e0e0e0);
   }
   ```

3. Add animation support:
   ```javascript
   if (config.animated && BMS.UI.Animations) {
       BMS.UI.Animations.fadeIn(element);
   }
   ```

4. Include accessibility features:
   ```javascript
   element.setAttribute('role', 'dialog');
   element.setAttribute('aria-label', config.label);
   ```

## 📱 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🤝 Contributing

When adding new components:

1. Create component folder with JS, CSS, and README
2. Follow the existing code style and patterns
3. Include usage examples in the README
4. Test across different browsers
5. Ensure dark theme is the default
6. Add smooth animations with reduced motion support

## 📄 License

Part of the BookmarkletIncludes project. See main project license for details.