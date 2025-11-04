/**
 * Data Viewer Template for BMS
 * Combines Panel, Table, Search, Export, and Filters into a complete data viewing interface
 * World-class UI/UX with smooth animations and sophisticated interactions
 */

(function() {
    // Extend BMS.UI namespace
    if (!window.BMS) window.BMS = {};
    if (!window.BMS.UI) window.BMS.UI = {};
    if (!window.BMS.UI.Templates) window.BMS.UI.Templates = {};

    BMS.UI.Templates.DataViewer = {
        /**
         * Create a complete data viewer interface
         * @param {Object} options - Configuration options
         * @returns {Object} Object with panel and table references
         */
        create: function(options = {}) {
            const defaults = {
                // Panel configuration
                title: 'Data Viewer',
                position: { top: 50, left: 50 },
                size: { width: 1200, height: 700 },
                icon: null,

                // Data configuration
                columns: [],
                data: [],

                // Features
                features: {
                    search: true,
                    export: true,
                    filters: true,
                    sort: true,
                    pagination: true,
                    selection: true,
                    columnResize: true,
                    refresh: true,
                    fullscreen: true,
                    settings: false
                },

                // Quick actions
                quickActions: [],

                // Styling
                theme: 'dark',
                animated: true,

                // Callbacks
                onRefresh: null,
                onExport: null,
                onRowClick: null,
                onRowSelect: null,
                onClose: null,

                // Custom sections
                headerContent: null,
                footerContent: null,
                sidePanel: null
            };

            const config = { ...defaults, ...options };

            // Create main content container
            const content = this._buildContent(config);

            // Create panel with enhanced features
            const panel = BMS.UI.Components?.Panel?.create({
                title: this._buildTitle(config),
                content: content,
                position: config.position,
                size: config.size,
                className: 'bms-data-viewer-panel',
                animation: config.animated,
                theme: config.theme,
                maximizable: config.features.fullscreen,
                onClose: config.onClose
            }) || this._createBasicPanel(config, content);

            // Create table inside the content area
            const tableContainer = content.querySelector('.bms-data-viewer-table');
            const table = BMS.UI.Components?.Table?.create({
                columns: config.columns,
                data: config.data,
                sortable: config.features.sort,
                filterable: config.features.filters,
                searchable: config.features.search,
                paginate: config.features.pagination,
                selectable: config.features.selection,
                resizableColumns: config.features.columnResize,
                dark: config.theme === 'dark',
                onRowClick: config.onRowClick,
                onRowSelect: config.onRowSelect
            }) || this._createBasicTable(config);

            tableContainer.appendChild(table);

            // Setup event handlers
            this._setupEventHandlers(panel, table, config);

            // Initialize with animations
            if (config.animated && BMS.UI.Animations) {
                BMS.UI.Animations.scale(panel, {
                    duration: 400,
                    from: 0.9,
                    to: 1
                });
            }

            // Return references
            return {
                panel: panel,
                table: table,
                updateData: (newData) => this.updateData(table, newData),
                destroy: () => this.destroy(panel, table),
                showLoading: () => this.showLoading(panel),
                hideLoading: () => this.hideLoading(panel),
                addQuickAction: (action) => this.addQuickAction(panel, action)
            };
        },

        /**
         * Build title with icon if provided
         */
        _buildTitle: function(config) {
            if (!config.icon) return config.title;

            return `
                <div style="display: flex; align-items: center; gap: 8px;">
                    ${config.icon}
                    <span>${config.title}</span>
                </div>
            `;
        },

        /**
         * Build content structure
         */
        _buildContent: function(config) {
            const content = document.createElement('div');
            content.className = 'bms-data-viewer-content';
            content.innerHTML = `
                ${config.headerContent ? `<div class="bms-data-viewer-header">${config.headerContent}</div>` : ''}

                <div class="bms-data-viewer-body ${config.sidePanel ? 'has-sidebar' : ''}">
                    ${config.sidePanel ? `
                        <div class="bms-data-viewer-sidebar">
                            <div class="bms-data-viewer-sidebar-content">
                                ${config.sidePanel}
                            </div>
                        </div>
                    ` : ''}

                    <div class="bms-data-viewer-main">
                        ${config.features.refresh || config.quickActions.length > 0 ? `
                            <div class="bms-data-viewer-toolbar">
                                <div class="bms-data-viewer-quick-actions"></div>
                                ${config.features.refresh ? `
                                    <button class="bms-data-viewer-refresh" title="Refresh data">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M13.65 2.35C12.2 0.9 10.21 0 8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C11.73 16 14.84 13.45 15.73 10H13.65C12.83 12.33 10.61 14 8 14C4.69 14 2 11.31 2 8C2 4.69 4.69 2 8 2C9.66 2 11.14 2.69 12.22 3.78L9 7H16V0L13.65 2.35Z" fill="currentColor"/>
                                        </svg>
                                        Refresh
                                    </button>
                                ` : ''}
                            </div>
                        ` : ''}

                        <div class="bms-data-viewer-table"></div>
                    </div>
                </div>

                ${config.footerContent ? `<div class="bms-data-viewer-footer">${config.footerContent}</div>` : ''}

                <div class="bms-data-viewer-status">
                    <div class="bms-data-viewer-status-text">Ready</div>
                    <div class="bms-data-viewer-status-actions"></div>
                </div>
            `;

            // Add quick actions
            if (config.quickActions.length > 0) {
                const actionsContainer = content.querySelector('.bms-data-viewer-quick-actions');
                config.quickActions.forEach(action => {
                    const btn = this._createQuickAction(action);
                    actionsContainer.appendChild(btn);
                });
            }

            return content;
        },

        /**
         * Create quick action button
         */
        _createQuickAction: function(action) {
            const defaults = {
                label: 'Action',
                icon: null,
                type: 'default',
                onClick: null,
                tooltip: null
            };

            const config = { ...defaults, ...action };

            const button = document.createElement('button');
            button.className = `bms-data-viewer-action bms-data-viewer-action-${config.type}`;
            button.title = config.tooltip || config.label;

            if (config.icon) {
                button.innerHTML = `${config.icon} <span>${config.label}</span>`;
            } else {
                button.textContent = config.label;
            }

            if (config.onClick) {
                button.addEventListener('click', config.onClick);
            }

            return button;
        },

        /**
         * Setup event handlers
         */
        _setupEventHandlers: function(panel, table, config) {
            // Refresh button
            if (config.features.refresh) {
                const refreshBtn = panel.querySelector('.bms-data-viewer-refresh');
                if (refreshBtn) {
                    refreshBtn.addEventListener('click', async () => {
                        refreshBtn.classList.add('bms-refreshing');
                        refreshBtn.disabled = true;

                        if (config.onRefresh) {
                            try {
                                const newData = await config.onRefresh();
                                if (newData && BMS.UI.Components?.Table?.updateData) {
                                    BMS.UI.Components.Table.updateData(table, newData);
                                }
                                this.updateStatus(panel, 'Data refreshed', 'success');
                            } catch (error) {
                                this.updateStatus(panel, 'Refresh failed', 'error');
                                console.error('Refresh error:', error);
                            }
                        }

                        setTimeout(() => {
                            refreshBtn.classList.remove('bms-refreshing');
                            refreshBtn.disabled = false;
                        }, 1000);
                    });
                }
            }

            // Export handling
            if (config.features.export && config.onExport) {
                // Override table's export function
                const originalExport = BMS.UI.Components?.Table?.exportData;
                if (originalExport) {
                    const exportBtns = table.querySelectorAll('.bms-table-export');
                    exportBtns.forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            config.onExport(table);
                        });
                    });
                }
            }
        },

        /**
         * Update status bar
         */
        updateStatus: function(panel, message, type = 'info') {
            const statusText = panel.querySelector('.bms-data-viewer-status-text');
            if (!statusText) return;

            statusText.textContent = message;
            statusText.className = `bms-data-viewer-status-text bms-status-${type}`;

            // Auto-clear after 3 seconds for non-error messages
            if (type !== 'error') {
                setTimeout(() => {
                    statusText.textContent = 'Ready';
                    statusText.className = 'bms-data-viewer-status-text';
                }, 3000);
            }
        },

        /**
         * Show loading state
         */
        showLoading: function(panel) {
            const tableArea = panel.querySelector('.bms-data-viewer-table');
            if (!tableArea) return;

            // Add loading overlay
            const loader = document.createElement('div');
            loader.className = 'bms-data-viewer-loading';
            loader.innerHTML = `
                <div class="bms-data-viewer-spinner">
                    <svg width="40" height="40" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="3" fill="none" opacity="0.2"/>
                        <circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="3" fill="none"
                                stroke-dasharray="90" stroke-dashoffset="20"
                                stroke-linecap="round">
                            <animateTransform
                                attributeName="transform"
                                type="rotate"
                                from="0 20 20"
                                to="360 20 20"
                                dur="1s"
                                repeatCount="indefinite"/>
                        </circle>
                    </svg>
                    <div>Loading data...</div>
                </div>
            `;

            tableArea.appendChild(loader);
            this.updateStatus(panel, 'Loading...', 'info');
        },

        /**
         * Hide loading state
         */
        hideLoading: function(panel) {
            const loader = panel.querySelector('.bms-data-viewer-loading');
            if (loader) {
                if (BMS.UI.Animations) {
                    BMS.UI.Animations.fadeOut(loader, {
                        duration: 200,
                        onComplete: () => loader.remove()
                    });
                } else {
                    loader.remove();
                }
            }
            this.updateStatus(panel, 'Ready', 'success');
        },

        /**
         * Add quick action dynamically
         */
        addQuickAction: function(panel, action) {
            const actionsContainer = panel.querySelector('.bms-data-viewer-quick-actions');
            if (actionsContainer) {
                const btn = this._createQuickAction(action);
                actionsContainer.appendChild(btn);

                if (BMS.UI.Animations) {
                    BMS.UI.Animations.fadeIn(btn, { duration: 200 });
                }
            }
        },

        /**
         * Update table data
         */
        updateData: function(table, newData) {
            if (BMS.UI.Components?.Table?.updateData) {
                BMS.UI.Components.Table.updateData(table, newData);
            }
        },

        /**
         * Destroy the viewer
         */
        destroy: function(panel, table) {
            if (BMS.UI.Components?.Panel?.destroy) {
                BMS.UI.Components.Panel.destroy(panel);
            } else {
                panel.remove();
            }
        },

        /**
         * Create basic panel fallback
         */
        _createBasicPanel: function(config, content) {
            const panel = document.createElement('div');
            panel.className = 'bms-basic-panel bms-data-viewer-panel';
            panel.style.cssText = `
                position: fixed;
                top: ${config.position.top}px;
                left: ${config.position.left}px;
                width: ${config.size.width}px;
                height: ${config.size.height}px;
                background: #1e1e1e;
                border: 1px solid #3a3a3a;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                z-index: 10000;
            `;

            const header = document.createElement('div');
            header.style.cssText = `
                padding: 16px 20px;
                background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
                border-bottom: 1px solid #3a3a3a;
                border-radius: 12px 12px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            header.innerHTML = `
                <div style="font-weight: 600; font-size: 16px; color: white;">${config.title}</div>
                <button onclick="this.closest('.bms-basic-panel').remove()" style="
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: white;
                    width: 30px;
                    height: 30px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 18px;
                ">×</button>
            `;

            const body = document.createElement('div');
            body.style.cssText = `
                flex: 1;
                overflow: auto;
                padding: 20px;
            `;
            body.appendChild(content);

            panel.appendChild(header);
            panel.appendChild(body);
            document.body.appendChild(panel);

            return panel;
        },

        /**
         * Create basic table fallback
         */
        _createBasicTable: function(config) {
            const container = document.createElement('div');
            container.innerHTML = `<div style="color: #999; padding: 20px;">Table component not available</div>`;
            return container;
        }
    };
})();