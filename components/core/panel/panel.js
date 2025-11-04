/**
 * Enhanced Panel Component for BMS
 * Provides draggable, resizable, collapsible panels with advanced features
 */

(function() {
    // Extend BMS.UI namespace
    if (!window.BMS) window.BMS = {};
    if (!window.BMS.UI) window.BMS.UI = {};
    if (!window.BMS.UI.Components) window.BMS.UI.Components = {};

    BMS.UI.Components.Panel = {
        /**
         * Create an enhanced panel with advanced features
         * @param {Object} options - Panel configuration
         * @returns {HTMLElement} Panel element
         */
        create: function(options = {}) {
            const defaults = {
                id: BMS.Utils?.generateId?.('panel') || 'bms-panel-' + Date.now(),
                title: 'Panel',
                content: '',
                position: { top: 50, left: 50 },
                size: { width: 400, height: 300 },
                draggable: true,
                resizable: true,
                collapsible: true,
                closeable: true,
                minimizable: true,
                maximizable: true,
                theme: 'light',
                animation: true,
                className: '',
                zIndex: 10000,
                onClose: null,
                onMinimize: null,
                onMaximize: null,
                onCollapse: null,
                onResize: null,
                onDrag: null
            };

            const config = { ...defaults, ...options };

            // Create panel element
            const panel = document.createElement('div');
            panel.id = config.id;
            panel.className = `bms-panel bms-panel-enhanced ${config.className} ${config.animation ? 'bms-animated' : ''}`;
            panel.style.cssText = `
                position: fixed;
                top: ${config.position.top}px;
                left: ${config.position.left}px;
                width: ${config.size.width}px;
                height: ${config.size.height}px;
                z-index: ${config.zIndex};
            `;

            // Create header
            const header = document.createElement('div');
            header.className = 'bms-panel-header';
            header.innerHTML = `
                <span class="bms-panel-title">${config.title}</span>
                <div class="bms-panel-controls">
                    ${config.collapsible ? '<button class="bms-panel-btn bms-panel-collapse" title="Collapse">─</button>' : ''}
                    ${config.minimizable ? '<button class="bms-panel-btn bms-panel-minimize" title="Minimize">_</button>' : ''}
                    ${config.maximizable ? '<button class="bms-panel-btn bms-panel-maximize" title="Maximize">□</button>' : ''}
                    ${config.closeable ? '<button class="bms-panel-btn bms-panel-close" title="Close">×</button>' : ''}
                </div>
            `;

            // Create content area
            const content = document.createElement('div');
            content.className = 'bms-panel-content';
            if (typeof config.content === 'string') {
                content.innerHTML = config.content;
            } else if (config.content instanceof HTMLElement) {
                content.appendChild(config.content);
            }

            // Create footer (for resize handle)
            const footer = document.createElement('div');
            footer.className = 'bms-panel-footer';
            if (config.resizable) {
                footer.innerHTML = '<div class="bms-panel-resizer">⋮</div>';
            }

            // Assemble panel
            panel.appendChild(header);
            panel.appendChild(content);
            if (config.resizable) {
                panel.appendChild(footer);
            }

            // Add to document
            document.body.appendChild(panel);

            // Setup interactions
            this._setupDragging(panel, header, config);
            this._setupResizing(panel, footer, config);
            this._setupControls(panel, config);

            // Store panel reference
            panel._bmsConfig = config;

            return panel;
        },

        /**
         * Setup dragging functionality
         */
        _setupDragging: function(panel, header, config) {
            if (!config.draggable) return;

            let isDragging = false;
            let startX, startY, initialX, initialY;

            header.style.cursor = 'move';

            const startDrag = (e) => {
                if (e.target.closest('.bms-panel-controls')) return;
                isDragging = true;
                startX = e.clientX || e.touches[0].clientX;
                startY = e.clientY || e.touches[0].clientY;
                initialX = panel.offsetLeft;
                initialY = panel.offsetTop;

                panel.classList.add('bms-dragging');
                e.preventDefault();
            };

            const drag = (e) => {
                if (!isDragging) return;

                const currentX = e.clientX || e.touches[0].clientX;
                const currentY = e.clientY || e.touches[0].clientY;
                const deltaX = currentX - startX;
                const deltaY = currentY - startY;

                panel.style.left = `${Math.max(0, initialX + deltaX)}px`;
                panel.style.top = `${Math.max(0, initialY + deltaY)}px`;

                if (config.onDrag) {
                    config.onDrag(panel, { x: panel.offsetLeft, y: panel.offsetTop });
                }
            };

            const stopDrag = () => {
                if (!isDragging) return;
                isDragging = false;
                panel.classList.remove('bms-dragging');
            };

            // Mouse events
            header.addEventListener('mousedown', startDrag);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);

            // Touch events
            header.addEventListener('touchstart', startDrag);
            document.addEventListener('touchmove', drag);
            document.addEventListener('touchend', stopDrag);
        },

        /**
         * Setup resizing functionality
         */
        _setupResizing: function(panel, footer, config) {
            if (!config.resizable) return;

            const resizer = footer.querySelector('.bms-panel-resizer');
            if (!resizer) return;

            let isResizing = false;
            let startX, startY, startWidth, startHeight;

            const startResize = (e) => {
                isResizing = true;
                startX = e.clientX || e.touches[0].clientX;
                startY = e.clientY || e.touches[0].clientY;
                startWidth = panel.offsetWidth;
                startHeight = panel.offsetHeight;

                panel.classList.add('bms-resizing');
                e.preventDefault();
            };

            const resize = (e) => {
                if (!isResizing) return;

                const currentX = e.clientX || e.touches[0].clientX;
                const currentY = e.clientY || e.touches[0].clientY;

                const newWidth = Math.max(200, startWidth + (currentX - startX));
                const newHeight = Math.max(150, startHeight + (currentY - startY));

                panel.style.width = `${newWidth}px`;
                panel.style.height = `${newHeight}px`;

                if (config.onResize) {
                    config.onResize(panel, { width: newWidth, height: newHeight });
                }
            };

            const stopResize = () => {
                if (!isResizing) return;
                isResizing = false;
                panel.classList.remove('bms-resizing');
            };

            // Mouse events
            resizer.addEventListener('mousedown', startResize);
            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);

            // Touch events
            resizer.addEventListener('touchstart', startResize);
            document.addEventListener('touchmove', resize);
            document.addEventListener('touchend', stopResize);
        },

        /**
         * Setup control buttons
         */
        _setupControls: function(panel, config) {
            const controls = panel.querySelector('.bms-panel-controls');
            if (!controls) return;

            // Close button
            const closeBtn = controls.querySelector('.bms-panel-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    if (config.onClose) {
                        config.onClose(panel);
                    }
                    this.destroy(panel);
                });
            }

            // Minimize button
            const minimizeBtn = controls.querySelector('.bms-panel-minimize');
            if (minimizeBtn) {
                minimizeBtn.addEventListener('click', () => {
                    this.minimize(panel);
                    if (config.onMinimize) {
                        config.onMinimize(panel);
                    }
                });
            }

            // Maximize button
            const maximizeBtn = controls.querySelector('.bms-panel-maximize');
            if (maximizeBtn) {
                maximizeBtn.addEventListener('click', () => {
                    this.maximize(panel);
                    if (config.onMaximize) {
                        config.onMaximize(panel);
                    }
                });
            }

            // Collapse button
            const collapseBtn = controls.querySelector('.bms-panel-collapse');
            if (collapseBtn) {
                collapseBtn.addEventListener('click', () => {
                    this.toggleCollapse(panel);
                    if (config.onCollapse) {
                        config.onCollapse(panel);
                    }
                });
            }
        },

        /**
         * Minimize panel
         */
        minimize: function(panel) {
            panel.classList.toggle('bms-minimized');
        },

        /**
         * Maximize panel
         */
        maximize: function(panel) {
            if (panel.classList.contains('bms-maximized')) {
                // Restore
                panel.classList.remove('bms-maximized');
                if (panel._bmsOriginalStyle) {
                    panel.style.cssText = panel._bmsOriginalStyle;
                }
            } else {
                // Maximize
                panel._bmsOriginalStyle = panel.style.cssText;
                panel.classList.add('bms-maximized');
                panel.style.top = '10px';
                panel.style.left = '10px';
                panel.style.width = 'calc(100% - 20px)';
                panel.style.height = 'calc(100% - 20px)';
            }
        },

        /**
         * Toggle collapse state
         */
        toggleCollapse: function(panel) {
            panel.classList.toggle('bms-collapsed');
            const btn = panel.querySelector('.bms-panel-collapse');
            if (btn) {
                btn.textContent = panel.classList.contains('bms-collapsed') ? '+' : '─';
            }
        },

        /**
         * Update panel content
         */
        updateContent: function(panel, content) {
            const contentArea = panel.querySelector('.bms-panel-content');
            if (!contentArea) return;

            if (typeof content === 'string') {
                contentArea.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                contentArea.innerHTML = '';
                contentArea.appendChild(content);
            }
        },

        /**
         * Destroy panel
         */
        destroy: function(panel) {
            if (panel.classList.contains('bms-animated')) {
                panel.classList.add('bms-panel-closing');
                setTimeout(() => panel.remove(), 300);
            } else {
                panel.remove();
            }
        },

        /**
         * Bring panel to front
         */
        bringToFront: function(panel) {
            const panels = document.querySelectorAll('.bms-panel');
            let maxZ = 10000;
            panels.forEach(p => {
                const z = parseInt(p.style.zIndex || 0);
                if (z > maxZ) maxZ = z;
            });
            panel.style.zIndex = maxZ + 1;
        }
    };
})();