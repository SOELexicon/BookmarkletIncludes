window.BMS = {
  config: {
    defaultPanelTop: 50,
    defaultPanelLeft: 50,
  },

  init: function(options = {}) {
    this.config = { ...this.config, ...options };
    this.injectCSS();
  },

  injectCSS: function() {
    if (document.getElementById('bms-styles')) return;
    const style = document.createElement('style');
    style.id = 'bms-styles';
    style.textContent = `
/* Bookmarklet Suite - CSS Library */

/* 1. Reset and Base Styles */
.bms-container, .bms-container * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--bms-text-color);
}

/* 2. CSS Variables for Theming */
.bms-container {
  --bms-primary-color: #007bff;
  --bms-background-color: #ffffff;
  --bms-text-color: #212529;
  --bms-border-color: #dee2e6;
  --bms-header-bg: #f8f9fa;
  --bms-shadow: 0 5px 15px rgba(0,0,0,0.15);
}

.bms-dark-theme {
  --bms-primary-color: #007bff;
  --bms-background-color: #212529;
  --bms-text-color: #f8f9fa;
  --bms-border-color: #495057;
  --bms-header-bg: #343a40;
}

/* 3. Panel Component */
.bms-panel {
  position: fixed;
  z-index: 9999;
  top: 50px;
  left: 50px;
  width: 350px;
  max-width: 90vw;
  background-color: var(--bms-background-color);
  border: 1px solid var(--bms-border-color);
  border-radius: 8px;
  box-shadow: var(--bms-shadow);
  display: flex;
  flex-direction: column;
}

.bms-panel-header {
  padding: 10px 15px;
  background-color: var(--bms-header-bg);
  border-bottom: 1px solid var(--bms-border-color);
  cursor: move;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 7px;
  border-top-right-radius: 7px;
}

.bms-panel-title {
  font-weight: bold;
}

.bms-panel-controls button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-left: 10px;
  color: var(--bms-text-color);
}

.bms-panel-content {
  padding: 15px;
  overflow-y: auto;
  flex-grow: 1;
}

.bms-panel-footer {
  padding: 10px 15px;
  border-top: 1px solid var(--bms-border-color);
  background-color: var(--bms-header-bg);
  border-bottom-left-radius: 7px;
  border-bottom-right-radius: 7px;
}

/* 4. Modal Component */
.bms-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.bms-modal {
  background-color: var(--bms-background-color);
  border-radius: 8px;
  box-shadow: var(--bms-shadow);
  width: 500px;
  max-width: 90%;
}

.bms-modal-header {
  padding: 10px 15px;
  background-color: var(--bms-header-bg);
  border-bottom: 1px solid var(--bms-border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 7px;
  border-top-right-radius: 7px;
}

.bms-modal-title {
  font-weight: bold;
}

.bms-modal-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: var(--bms-text-color);
}

.bms-modal-content {
  padding: 15px;
}

/* 5. Spinner Component */
.bms-spinner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10001;
  display: flex;
  justify-content: center;
  align-items: center;
}

.bms-spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid #fff;
  width: 40px;
  height: 40px;
  animation: bms-spin 1s linear infinite;
}

@keyframes bms-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 6. Status Bar Component */
.bms-status-bar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 5px;
  color: #fff;
  z-index: 10002;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.bms-status-bar.bms-show {
  opacity: 1;
}

.bms-status-info { background-color: #007bff; }
.bms-status-success { background-color: #28a745; }
.bms-status-warning { background-color: #ffc107; color: #212529; }
.bms-status-error { background-color: #dc3545; }

/* 7. Button Component */
.bms-button {
  display: inline-block;
  padding: 8px 12px;
  border: 1px solid var(--bms-border-color);
  background-color: var(--bms-background-color);
  color: var(--bms-text-color);
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
}

.bms-button:hover {
  opacity: 0.9;
}

.bms-button-primary {
  background-color: var(--bms-primary-color);
  color: #fff;
  border-color: var(--bms-primary-color);
}
    `;
    document.head.appendChild(style);
  },

  UI: {
    createPanel: function({ id, title, content, footer }) {
      if (document.getElementById(id)) return;

      const panel = document.createElement('div');
      panel.id = id;
      panel.className = 'bms-panel bms-container'; // Add bms-container for style scoping

      // Header
      const header = document.createElement('div');
      header.className = 'bms-panel-header';
      header.innerHTML = `
        <span class="bms-panel-title">${title}</span>
        <div class="bms-panel-controls">
          <button class="bms-minimize-btn">-</button>
          <button class="bms-close-btn">×</button>
        </div>
      `;

      // Content
      const contentContainer = document.createElement('div');
      contentContainer.className = 'bms-panel-content';
      BMS.DOM.setHTML(contentContainer, content);

      // Footer
      let footerContainer;
      if (footer) {
        footerContainer = document.createElement('div');
        footerContainer.className = 'bms-panel-footer';
        BMS.DOM.setHTML(footerContainer, footer);
      }

      // Assemble
      panel.appendChild(header);
      panel.appendChild(contentContainer);
      if (footerContainer) panel.appendChild(footerContainer);

      document.body.appendChild(panel);

      // Add functionality
      this._makeDraggable(panel, header);
      this._addPanelControls(panel);
      
      return panel;
    },

    createModal: function({ id, title, content }) {
      if (document.getElementById(id)) return;

      const overlay = document.createElement('div');
      overlay.id = id;
      overlay.className = 'bms-modal-overlay bms-container';

      const modal = document.createElement('div');
      modal.className = 'bms-modal';

      // Header
      const header = document.createElement('div');
      header.className = 'bms-modal-header';
      header.innerHTML = `
        <span class="bms-modal-title">${title}</span>
        <button class="bms-modal-close-btn">×</button>
      `;

      // Content
      const contentContainer = document.createElement('div');
      contentContainer.className = 'bms-modal-content';
      BMS.DOM.setHTML(contentContainer, content);

      // Assemble
      modal.appendChild(header);
      modal.appendChild(contentContainer);
      overlay.appendChild(modal);

      document.body.appendChild(overlay);

      // Add functionality
      overlay.querySelector('.bms-modal-close-btn').onclick = () => overlay.remove();
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          overlay.remove();
        }
      };

      return overlay;
    },

    showSpinner: function() {
      if (document.getElementById('bms-spinner')) return;
      const spinnerOverlay = document.createElement('div');
      spinnerOverlay.id = 'bms-spinner';
      spinnerOverlay.className = 'bms-spinner-overlay bms-container';
      spinnerOverlay.innerHTML = '<div class="bms-spinner"></div>';
      document.body.appendChild(spinnerOverlay);
    },

    hideSpinner: function() {
      const spinnerOverlay = document.getElementById('bms-spinner');
      if (spinnerOverlay) spinnerOverlay.remove();
    },

    updateStatus: function(message, level = 'info', duration = 3000) {
      let statusBar = document.getElementById('bms-status-bar');
      if (!statusBar) {
        statusBar = document.createElement('div');
        statusBar.id = 'bms-status-bar';
        statusBar.className = 'bms-status-bar bms-container';
        document.body.appendChild(statusBar);
      }

      statusBar.textContent = message;
      statusBar.className = `bms-status-bar bms-container bms-status-${level}`;
      
      // Show status bar
      setTimeout(() => statusBar.classList.add('bms-show'), 10);

      // Hide after duration
      setTimeout(() => {
        statusBar.classList.remove('bms-show');
      }, duration);
    },



    _makeDraggable: function(panel, handle) {
      let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
      handle.onmousedown = dragMouseDown;

      function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
      }

      function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        panel.style.top = (panel.offsetTop - pos2) + "px";
        panel.style.left = (panel.offsetLeft - pos1) + "px";
      }

      function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
      }
    },
    
    _addPanelControls: function(panel) {
        const closeBtn = panel.querySelector('.bms-close-btn');
        const minimizeBtn = panel.querySelector('.bms-minimize-btn');
        const content = panel.querySelector('.bms-panel-content');
        const footer = panel.querySelector('.bms-panel-footer');

        closeBtn.onclick = () => panel.remove();
        
        minimizeBtn.onclick = () => {
            const isMinimized = content.style.display === 'none';
            content.style.display = isMinimized ? '' : 'none';
            if(footer) footer.style.display = isMinimized ? '' : 'none';
            minimizeBtn.textContent = isMinimized ? '-' : '+';
        };
    }
  },

  DOM: {
    select: function(selector) {
      return document.querySelector(selector);
    },
    selectAll: function(selector) {
      return document.querySelectorAll(selector);
    },
    setHTML: function(element, html) {
      // Basic protection against script injection
      const sanitizedHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      element.innerHTML = sanitizedHtml;
    }
  },

  Utils: {
    generateId: function(prefix = 'bms-') {
      return prefix + Math.random().toString(36).substr(2, 9);
    },

    copyToClipboard: function(text) {
      const ta = document.createElement('textarea');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        BMS.UI.updateStatus('Copied to clipboard!', 'success');
      } catch (err) {
        BMS.UI.updateStatus('Failed to copy', 'error');
      }
      document.body.removeChild(ta);
    }
  }
};