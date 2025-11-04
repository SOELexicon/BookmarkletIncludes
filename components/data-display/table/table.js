/**
 * Advanced Data Table Component for BMS
 * World-class table with sorting, filtering, pagination, and virtual scrolling
 */

(function() {
    // Extend BMS.UI namespace
    if (!window.BMS) window.BMS = {};
    if (!window.BMS.UI) window.BMS.UI = {};
    if (!window.BMS.UI.Components) window.BMS.UI.Components = {};

    BMS.UI.Components.Table = {
        /**
         * Create an advanced data table
         * @param {Object} options - Table configuration
         * @returns {HTMLElement} Table container element
         */
        create: function(options = {}) {
            const defaults = {
                id: BMS.Utils?.generateId?.('table') || 'bms-table-' + Date.now(),
                columns: [],
                data: [],
                className: '',

                // Features
                sortable: true,
                filterable: true,
                searchable: true,
                paginate: true,
                selectable: true,
                resizableColumns: true,
                virtualScroll: false,
                stickyHeader: true,

                // Configuration
                pageSize: 25,
                pageSizes: [10, 25, 50, 100],
                height: 'auto',
                maxHeight: '600px',
                rowHeight: 48,
                headerHeight: 56,

                // Appearance
                striped: true,
                hover: true,
                bordered: true,
                compact: false,
                dark: true,

                // Callbacks
                onSort: null,
                onFilter: null,
                onSearch: null,
                onPageChange: null,
                onRowClick: null,
                onRowSelect: null,
                onCellEdit: null,

                // Custom renderers
                cellRenderer: null,
                headerRenderer: null,
                emptyRenderer: null
            };

            const config = { ...defaults, ...options };

            // Create container
            const container = document.createElement('div');
            container.id = config.id;
            container.className = `bms-table-container ${config.className} ${config.dark ? 'bms-dark' : ''}`;

            // Initialize table state
            container._bmsTableState = {
                config: config,
                data: [...config.data],
                filteredData: [...config.data],
                displayData: [],
                sortColumn: null,
                sortDirection: 'asc',
                searchTerm: '',
                filters: {},
                currentPage: 1,
                selectedRows: new Set(),
                columnWidths: {}
            };

            // Build table components
            this._buildToolbar(container);
            this._buildTable(container);
            this._buildPagination(container);

            // Initialize features
            if (config.virtualScroll) {
                this._initVirtualScroll(container);
            }

            // Apply initial data
            this._updateDisplay(container);

            return container;
        },

        /**
         * Build toolbar with search and controls
         */
        _buildToolbar: function(container) {
            const state = container._bmsTableState;
            const config = state.config;

            if (!config.searchable && !config.filterable) return;

            const toolbar = document.createElement('div');
            toolbar.className = 'bms-table-toolbar';

            // Search box
            if (config.searchable) {
                const searchWrapper = document.createElement('div');
                searchWrapper.className = 'bms-table-search';
                searchWrapper.innerHTML = `
                    <svg class="bms-table-search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M9 3.5C5.91 3.5 3.5 5.91 3.5 9C3.5 12.09 5.91 14.5 9 14.5C10.46 14.5 11.79 13.96 12.8 13.07L16.22 16.49L17.28 15.43L13.86 12.01C14.75 11 15.3 9.67 15.3 8.2C15.3 5.11 12.89 2.7 9.8 2.7C9.53 2.7 9.27 2.72 9 2.75V3.5ZM9 13C6.74 13 5 11.26 5 9C5 6.74 6.74 5 9 5C11.26 5 13 6.74 13 9C13 11.26 11.26 13 9 13Z" fill="currentColor"/>
                    </svg>
                    <input type="text" class="bms-table-search-input" placeholder="Search...">
                    <button class="bms-table-search-clear" style="display: none;">×</button>
                `;
                toolbar.appendChild(searchWrapper);

                // Search event handlers
                const searchInput = searchWrapper.querySelector('.bms-table-search-input');
                const clearBtn = searchWrapper.querySelector('.bms-table-search-clear');

                searchInput.addEventListener('input', (e) => {
                    state.searchTerm = e.target.value;
                    clearBtn.style.display = e.target.value ? 'block' : 'none';
                    this._debounce(() => {
                        this._applyFilters(container);
                        if (config.onSearch) config.onSearch(e.target.value);
                    }, 300)();
                });

                clearBtn.addEventListener('click', () => {
                    searchInput.value = '';
                    state.searchTerm = '';
                    clearBtn.style.display = 'none';
                    this._applyFilters(container);
                });
            }

            // Additional controls
            const controls = document.createElement('div');
            controls.className = 'bms-table-controls';

            // Export button
            const exportBtn = document.createElement('button');
            exportBtn.className = 'bms-table-btn bms-table-export';
            exportBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 12L3 7H6V1H10V7H13L8 12Z" fill="currentColor"/>
                    <path d="M14 14H2V15H14V14Z" fill="currentColor"/>
                </svg>
                Export
            `;
            exportBtn.addEventListener('click', () => this.exportData(container));
            controls.appendChild(exportBtn);

            // Column visibility toggle
            const columnsBtn = document.createElement('button');
            columnsBtn.className = 'bms-table-btn bms-table-columns';
            columnsBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="3" width="3" height="10" fill="currentColor"/>
                    <rect x="6.5" y="3" width="3" height="10" fill="currentColor"/>
                    <rect x="11" y="3" width="3" height="10" fill="currentColor"/>
                </svg>
                Columns
            `;
            columnsBtn.addEventListener('click', () => this._showColumnSelector(container));
            controls.appendChild(columnsBtn);

            toolbar.appendChild(controls);
            container.appendChild(toolbar);
        },

        /**
         * Build main table
         */
        _buildTable: function(container) {
            const state = container._bmsTableState;
            const config = state.config;

            // Table wrapper
            const tableWrapper = document.createElement('div');
            tableWrapper.className = 'bms-table-wrapper';
            if (config.height !== 'auto') {
                tableWrapper.style.height = config.height;
            }
            if (config.maxHeight !== 'auto') {
                tableWrapper.style.maxHeight = config.maxHeight;
            }

            // Table element
            const table = document.createElement('table');
            table.className = `bms-table ${config.striped ? 'bms-table-striped' : ''} ${config.hover ? 'bms-table-hover' : ''} ${config.bordered ? 'bms-table-bordered' : ''} ${config.compact ? 'bms-table-compact' : ''}`;

            // Build header
            const thead = document.createElement('thead');
            if (config.stickyHeader) {
                thead.className = 'bms-table-sticky-header';
            }

            const headerRow = document.createElement('tr');

            // Selection checkbox column
            if (config.selectable) {
                const th = document.createElement('th');
                th.className = 'bms-table-select-all';
                th.innerHTML = '<input type="checkbox" class="bms-table-checkbox">';

                th.querySelector('input').addEventListener('change', (e) => {
                    this._toggleAllRows(container, e.target.checked);
                });

                headerRow.appendChild(th);
            }

            // Data columns
            config.columns.forEach((column, index) => {
                const th = document.createElement('th');
                th.className = 'bms-table-header';
                th.dataset.column = column.key;

                // Header content
                const headerContent = document.createElement('div');
                headerContent.className = 'bms-table-header-content';

                // Column title
                const title = document.createElement('span');
                title.className = 'bms-table-header-title';
                title.textContent = column.title || column.key;
                headerContent.appendChild(title);

                // Sort indicator
                if (config.sortable && column.sortable !== false) {
                    const sortIcon = document.createElement('span');
                    sortIcon.className = 'bms-table-sort-icon';
                    sortIcon.innerHTML = `
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 3L10 6H4L7 3Z" fill="currentColor" opacity="0.3"/>
                            <path d="M7 11L4 8H10L7 11Z" fill="currentColor" opacity="0.3"/>
                        </svg>
                    `;
                    headerContent.appendChild(sortIcon);

                    th.addEventListener('click', () => {
                        this._sortColumn(container, column.key);
                    });
                    th.style.cursor = 'pointer';
                }

                // Filter dropdown
                if (config.filterable && column.filterable !== false) {
                    const filterBtn = document.createElement('button');
                    filterBtn.className = 'bms-table-filter-btn';
                    filterBtn.innerHTML = `
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3 3H11L8 7V11L6 12V7L3 3Z" fill="currentColor"/>
                        </svg>
                    `;
                    filterBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this._showFilterMenu(container, column.key, filterBtn);
                    });
                    headerContent.appendChild(filterBtn);
                }

                th.appendChild(headerContent);

                // Column resize handle
                if (config.resizableColumns) {
                    const resizer = document.createElement('div');
                    resizer.className = 'bms-table-column-resizer';
                    resizer.addEventListener('mousedown', (e) => {
                        this._startColumnResize(container, th, e);
                    });
                    th.appendChild(resizer);
                }

                headerRow.appendChild(th);
            });

            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Table body
            const tbody = document.createElement('tbody');
            tbody.className = 'bms-table-body';
            table.appendChild(tbody);

            tableWrapper.appendChild(table);
            container.appendChild(tableWrapper);

            // Store references
            container._bmsTable = table;
            container._bmsTableWrapper = tableWrapper;
            container._bmsTableBody = tbody;
        },

        /**
         * Build pagination controls
         */
        _buildPagination: function(container) {
            const state = container._bmsTableState;
            const config = state.config;

            if (!config.paginate) return;

            const pagination = document.createElement('div');
            pagination.className = 'bms-table-pagination';

            // Page size selector
            const pageSizeWrapper = document.createElement('div');
            pageSizeWrapper.className = 'bms-table-page-size';
            pageSizeWrapper.innerHTML = `
                <span>Show</span>
                <select class="bms-table-page-size-select">
                    ${config.pageSizes.map(size =>
                        `<option value="${size}" ${size === config.pageSize ? 'selected' : ''}>${size}</option>`
                    ).join('')}
                </select>
                <span>entries</span>
            `;

            pageSizeWrapper.querySelector('select').addEventListener('change', (e) => {
                config.pageSize = parseInt(e.target.value);
                state.currentPage = 1;
                this._updateDisplay(container);
            });

            pagination.appendChild(pageSizeWrapper);

            // Page info
            const pageInfo = document.createElement('div');
            pageInfo.className = 'bms-table-page-info';
            pagination.appendChild(pageInfo);

            // Page controls
            const pageControls = document.createElement('div');
            pageControls.className = 'bms-table-page-controls';
            pageControls.innerHTML = `
                <button class="bms-table-page-btn bms-table-page-first" title="First page">⟨⟨</button>
                <button class="bms-table-page-btn bms-table-page-prev" title="Previous page">⟨</button>
                <div class="bms-table-page-numbers"></div>
                <button class="bms-table-page-btn bms-table-page-next" title="Next page">⟩</button>
                <button class="bms-table-page-btn bms-table-page-last" title="Last page">⟩⟩</button>
            `;

            // Page control events
            pageControls.querySelector('.bms-table-page-first').addEventListener('click', () => {
                state.currentPage = 1;
                this._updateDisplay(container);
            });

            pageControls.querySelector('.bms-table-page-prev').addEventListener('click', () => {
                if (state.currentPage > 1) {
                    state.currentPage--;
                    this._updateDisplay(container);
                }
            });

            pageControls.querySelector('.bms-table-page-next').addEventListener('click', () => {
                const totalPages = Math.ceil(state.filteredData.length / config.pageSize);
                if (state.currentPage < totalPages) {
                    state.currentPage++;
                    this._updateDisplay(container);
                }
            });

            pageControls.querySelector('.bms-table-page-last').addEventListener('click', () => {
                const totalPages = Math.ceil(state.filteredData.length / config.pageSize);
                state.currentPage = totalPages;
                this._updateDisplay(container);
            });

            pagination.appendChild(pageControls);
            container.appendChild(pagination);

            container._bmsTablePagination = pagination;
        },

        /**
         * Update table display
         */
        _updateDisplay: function(container) {
            const state = container._bmsTableState;
            const config = state.config;
            const tbody = container._bmsTableBody;

            // Clear existing rows
            tbody.innerHTML = '';

            // Calculate page data
            let displayData;
            if (config.paginate) {
                const start = (state.currentPage - 1) * config.pageSize;
                const end = start + config.pageSize;
                displayData = state.filteredData.slice(start, end);
            } else {
                displayData = state.filteredData;
            }

            state.displayData = displayData;

            // Render rows
            if (displayData.length === 0) {
                const emptyRow = document.createElement('tr');
                const emptyCell = document.createElement('td');
                emptyCell.colSpan = config.columns.length + (config.selectable ? 1 : 0);
                emptyCell.className = 'bms-table-empty';

                if (config.emptyRenderer) {
                    emptyCell.innerHTML = config.emptyRenderer(state.searchTerm, state.filters);
                } else {
                    emptyCell.innerHTML = `
                        <div class="bms-table-empty-content">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                <path d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM24 40C15.18 40 8 32.82 8 24C8 15.18 15.18 8 24 8C32.82 8 40 15.18 40 24C40 32.82 32.82 40 24 40Z" fill="currentColor" opacity="0.3"/>
                                <path d="M22 14H26V26H22V14ZM22 30H26V34H22V30Z" fill="currentColor"/>
                            </svg>
                            <p>No data found</p>
                        </div>
                    `;
                }

                emptyRow.appendChild(emptyCell);
                tbody.appendChild(emptyRow);
            } else {
                displayData.forEach((row, rowIndex) => {
                    const tr = this._renderRow(container, row, rowIndex);
                    tbody.appendChild(tr);
                });
            }

            // Update pagination
            if (config.paginate) {
                this._updatePagination(container);
            }

            // Animate new rows
            if (BMS.UI.Animations) {
                const rows = tbody.querySelectorAll('tr');
                BMS.UI.Animations.stagger(rows, 'fadeIn', {
                    duration: 200,
                    staggerDelay: 20
                });
            }
        },

        /**
         * Render a single row
         */
        _renderRow: function(container, rowData, rowIndex) {
            const state = container._bmsTableState;
            const config = state.config;

            const tr = document.createElement('tr');
            tr.className = 'bms-table-row';
            tr.dataset.rowIndex = rowIndex;

            // Selection checkbox
            if (config.selectable) {
                const td = document.createElement('td');
                td.className = 'bms-table-select';
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'bms-table-checkbox';
                checkbox.checked = state.selectedRows.has(rowIndex);

                checkbox.addEventListener('change', (e) => {
                    this._toggleRowSelection(container, rowIndex, e.target.checked);
                });

                td.appendChild(checkbox);
                tr.appendChild(td);
            }

            // Data cells
            config.columns.forEach(column => {
                const td = document.createElement('td');
                td.className = 'bms-table-cell';
                td.dataset.column = column.key;

                let cellContent = rowData[column.key];

                // Apply cell renderer
                if (column.renderer) {
                    cellContent = column.renderer(cellContent, rowData, rowIndex);
                } else if (config.cellRenderer) {
                    cellContent = config.cellRenderer(cellContent, column, rowData, rowIndex);
                }

                // Handle different content types
                if (cellContent instanceof HTMLElement) {
                    td.appendChild(cellContent);
                } else {
                    td.innerHTML = cellContent != null ? cellContent : '';
                }

                // Add alignment
                if (column.align) {
                    td.style.textAlign = column.align;
                }

                // Add click handler
                if (column.onClick) {
                    td.style.cursor = 'pointer';
                    td.addEventListener('click', () => {
                        column.onClick(rowData[column.key], rowData, rowIndex);
                    });
                }

                tr.appendChild(td);
            });

            // Row click handler
            if (config.onRowClick) {
                tr.style.cursor = 'pointer';
                tr.addEventListener('click', (e) => {
                    if (!e.target.closest('.bms-table-select')) {
                        config.onRowClick(rowData, rowIndex, e);
                    }
                });
            }

            return tr;
        },

        /**
         * Sort column
         */
        _sortColumn: function(container, columnKey) {
            const state = container._bmsTableState;
            const config = state.config;

            // Update sort state
            if (state.sortColumn === columnKey) {
                state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                state.sortColumn = columnKey;
                state.sortDirection = 'asc';
            }

            // Sort data
            state.filteredData.sort((a, b) => {
                let aVal = a[columnKey];
                let bVal = b[columnKey];

                // Handle null/undefined
                if (aVal == null) return state.sortDirection === 'asc' ? 1 : -1;
                if (bVal == null) return state.sortDirection === 'asc' ? -1 : 1;

                // Numeric comparison
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return state.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                }

                // String comparison
                aVal = String(aVal).toLowerCase();
                bVal = String(bVal).toLowerCase();

                if (aVal < bVal) return state.sortDirection === 'asc' ? -1 : 1;
                if (aVal > bVal) return state.sortDirection === 'asc' ? 1 : -1;
                return 0;
            });

            // Update sort indicators
            container.querySelectorAll('.bms-table-header').forEach(th => {
                th.classList.remove('bms-sorted-asc', 'bms-sorted-desc');
                if (th.dataset.column === columnKey) {
                    th.classList.add(`bms-sorted-${state.sortDirection}`);
                }
            });

            // Reset to first page
            state.currentPage = 1;

            // Update display
            this._updateDisplay(container);

            // Callback
            if (config.onSort) {
                config.onSort(columnKey, state.sortDirection);
            }
        },

        /**
         * Apply filters
         */
        _applyFilters: function(container) {
            const state = container._bmsTableState;
            const config = state.config;

            // Start with all data
            state.filteredData = [...state.data];

            // Apply search filter
            if (state.searchTerm) {
                const searchLower = state.searchTerm.toLowerCase();
                state.filteredData = state.filteredData.filter(row => {
                    return config.columns.some(column => {
                        const value = row[column.key];
                        if (value == null) return false;
                        return String(value).toLowerCase().includes(searchLower);
                    });
                });
            }

            // Apply column filters
            Object.keys(state.filters).forEach(columnKey => {
                const filterValues = state.filters[columnKey];
                if (filterValues && filterValues.length > 0) {
                    state.filteredData = state.filteredData.filter(row => {
                        return filterValues.includes(row[columnKey]);
                    });
                }
            });

            // Re-sort if needed
            if (state.sortColumn) {
                this._sortColumn(container, state.sortColumn);
            } else {
                // Reset to first page and update
                state.currentPage = 1;
                this._updateDisplay(container);
            }

            // Callback
            if (config.onFilter) {
                config.onFilter(state.filters, state.searchTerm);
            }
        },

        /**
         * Update pagination controls
         */
        _updatePagination: function(container) {
            const state = container._bmsTableState;
            const config = state.config;
            const pagination = container._bmsTablePagination;

            if (!pagination) return;

            const totalItems = state.filteredData.length;
            const totalPages = Math.ceil(totalItems / config.pageSize);
            const start = (state.currentPage - 1) * config.pageSize + 1;
            const end = Math.min(state.currentPage * config.pageSize, totalItems);

            // Update page info
            const pageInfo = pagination.querySelector('.bms-table-page-info');
            pageInfo.textContent = totalItems > 0
                ? `Showing ${start} to ${end} of ${totalItems} entries`
                : 'No entries';

            // Update page buttons
            const pageNumbers = pagination.querySelector('.bms-table-page-numbers');
            pageNumbers.innerHTML = '';

            // Generate page numbers
            const maxButtons = 5;
            let startPage = Math.max(1, state.currentPage - Math.floor(maxButtons / 2));
            let endPage = Math.min(totalPages, startPage + maxButtons - 1);

            if (endPage - startPage < maxButtons - 1) {
                startPage = Math.max(1, endPage - maxButtons + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                const btn = document.createElement('button');
                btn.className = `bms-table-page-btn ${i === state.currentPage ? 'active' : ''}`;
                btn.textContent = i;
                btn.addEventListener('click', () => {
                    state.currentPage = i;
                    this._updateDisplay(container);
                });
                pageNumbers.appendChild(btn);
            }

            // Enable/disable navigation buttons
            const controls = pagination.querySelector('.bms-table-page-controls');
            controls.querySelector('.bms-table-page-first').disabled = state.currentPage === 1;
            controls.querySelector('.bms-table-page-prev').disabled = state.currentPage === 1;
            controls.querySelector('.bms-table-page-next').disabled = state.currentPage === totalPages;
            controls.querySelector('.bms-table-page-last').disabled = state.currentPage === totalPages;

            // Callback
            if (config.onPageChange) {
                config.onPageChange(state.currentPage, totalPages);
            }
        },

        /**
         * Export table data
         */
        exportData: function(container, format = 'csv') {
            const state = container._bmsTableState;
            const config = state.config;

            let content = '';
            let mimeType = '';
            let filename = '';

            if (format === 'csv') {
                // Generate CSV
                const headers = config.columns.map(col => col.title || col.key).join(',');
                const rows = state.filteredData.map(row => {
                    return config.columns.map(col => {
                        const value = row[col.key];
                        return value != null ? `"${String(value).replace(/"/g, '""')}"` : '""';
                    }).join(',');
                });

                content = [headers, ...rows].join('\n');
                mimeType = 'text/csv';
                filename = 'table-export.csv';
            } else if (format === 'json') {
                // Generate JSON
                content = JSON.stringify(state.filteredData, null, 2);
                mimeType = 'application/json';
                filename = 'table-export.json';
            }

            // Download file
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
        },

        /**
         * Update table data
         */
        updateData: function(container, newData) {
            const state = container._bmsTableState;
            state.data = [...newData];
            state.filteredData = [...newData];
            state.currentPage = 1;
            this._applyFilters(container);
        },

        /**
         * Debounce helper
         */
        _debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    };
})();