/**
 * Enhanced Modal Component for BMS
 * Provides modal dialogs with animations and advanced features
 */

(function() {
    // Extend BMS.UI namespace
    if (!window.BMS) window.BMS = {};
    if (!window.BMS.UI) window.BMS.UI = {};
    if (!window.BMS.UI.Components) window.BMS.UI.Components = {};

    BMS.UI.Components.Modal = {
        activeModals: [],

        /**
         * Create a modal dialog
         * @param {Object} options - Modal configuration
         * @returns {HTMLElement} Modal element
         */
        create: function(options = {}) {
            const defaults = {
                id: BMS.Utils?.generateId?.('modal') || 'bms-modal-' + Date.now(),
                title: 'Modal',
                content: '',
                size: 'medium', // small, medium, large, fullscreen
                backdrop: true,
                closeOnBackdrop: true,
                closeButton: true,
                animation: true,
                centered: true,
                keyboard: true, // Close on ESC
                footer: null,
                buttons: [],
                className: '',
                zIndex: 11000,
                onOpen: null,
                onClose: null,
                onAction: null
            };

            const config = { ...defaults, ...options };

            // Create overlay
            const overlay = document.createElement('div');
            overlay.className = `bms-modal-overlay ${config.animation ? 'bms-animated' : ''}`;
            overlay.style.zIndex = config.zIndex;

            // Create modal container
            const modal = document.createElement('div');
            modal.id = config.id;
            modal.className = `bms-modal bms-modal-${config.size} ${config.className} ${config.animation ? 'bms-animated' : ''} ${config.centered ? 'bms-modal-centered' : ''}`;
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-labelledby', `${config.id}-title`);

            // Create header
            const header = document.createElement('div');
            header.className = 'bms-modal-header';
            header.innerHTML = `
                <h3 class="bms-modal-title" id="${config.id}-title">${config.title}</h3>
                ${config.closeButton ? '<button class="bms-modal-close" aria-label="Close">×</button>' : ''}
            `;

            // Create body
            const body = document.createElement('div');
            body.className = 'bms-modal-body';
            if (typeof config.content === 'string') {
                body.innerHTML = config.content;
            } else if (config.content instanceof HTMLElement) {
                body.appendChild(config.content);
            }

            // Create footer if needed
            let footer = null;
            if (config.footer || config.buttons.length > 0) {
                footer = document.createElement('div');
                footer.className = 'bms-modal-footer';

                if (config.footer) {
                    if (typeof config.footer === 'string') {
                        footer.innerHTML = config.footer;
                    } else if (config.footer instanceof HTMLElement) {
                        footer.appendChild(config.footer);
                    }
                } else if (config.buttons.length > 0) {
                    const buttonContainer = document.createElement('div');
                    buttonContainer.className = 'bms-modal-buttons';

                    config.buttons.forEach(btnConfig => {
                        const button = this._createButton(btnConfig, config, modal);
                        buttonContainer.appendChild(button);
                    });

                    footer.appendChild(buttonContainer);
                }
            }

            // Assemble modal
            modal.appendChild(header);
            modal.appendChild(body);
            if (footer) {
                modal.appendChild(footer);
            }

            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            // Setup interactions
            this._setupEvents(overlay, modal, config);

            // Store reference
            modal._bmsConfig = config;
            this.activeModals.push(modal);

            // Trigger open callback
            if (config.onOpen) {
                config.onOpen(modal);
            }

            // Focus management
            this._manageFocus(modal);

            return modal;
        },

        /**
         * Create a button element
         */
        _createButton: function(btnConfig, modalConfig, modal) {
            const defaults = {
                text: 'Button',
                type: 'default', // default, primary, danger, success
                action: null,
                closeOnClick: true
            };

            const config = { ...defaults, ...btnConfig };

            const button = document.createElement('button');
            button.className = `bms-modal-btn bms-modal-btn-${config.type}`;
            button.textContent = config.text;

            button.addEventListener('click', () => {
                if (config.action) {
                    config.action(modal);
                }

                if (modalConfig.onAction) {
                    modalConfig.onAction(config.text, modal);
                }

                if (config.closeOnClick) {
                    this.close(modal);
                }
            });

            return button;
        },

        /**
         * Setup event handlers
         */
        _setupEvents: function(overlay, modal, config) {
            // Close button
            const closeBtn = modal.querySelector('.bms-modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.close(modal);
                });
            }

            // Backdrop click
            if (config.backdrop && config.closeOnBackdrop) {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        this.close(modal);
                    }
                });
            }

            // Keyboard events
            if (config.keyboard) {
                const handleKeydown = (e) => {
                    if (e.key === 'Escape') {
                        const topModal = this.activeModals[this.activeModals.length - 1];
                        if (topModal === modal) {
                            this.close(modal);
                        }
                    }
                };

                document.addEventListener('keydown', handleKeydown);
                modal._bmsKeyHandler = handleKeydown;
            }
        },

        /**
         * Manage focus for accessibility
         */
        _manageFocus: function(modal) {
            // Store previously focused element
            modal._previousFocus = document.activeElement;

            // Get all focusable elements
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            if (focusableElements.length > 0) {
                // Focus first element
                setTimeout(() => focusableElements[0].focus(), 100);

                // Trap focus within modal
                const firstFocusable = focusableElements[0];
                const lastFocusable = focusableElements[focusableElements.length - 1];

                modal.addEventListener('keydown', (e) => {
                    if (e.key === 'Tab') {
                        if (e.shiftKey) {
                            if (document.activeElement === firstFocusable) {
                                e.preventDefault();
                                lastFocusable.focus();
                            }
                        } else {
                            if (document.activeElement === lastFocusable) {
                                e.preventDefault();
                                firstFocusable.focus();
                            }
                        }
                    }
                });
            }
        },

        /**
         * Close a modal
         */
        close: function(modal) {
            const config = modal._bmsConfig;
            const overlay = modal.closest('.bms-modal-overlay');

            // Trigger close callback
            if (config.onClose) {
                config.onClose(modal);
            }

            // Remove from active modals
            const index = this.activeModals.indexOf(modal);
            if (index > -1) {
                this.activeModals.splice(index, 1);
            }

            // Remove keyboard handler
            if (modal._bmsKeyHandler) {
                document.removeEventListener('keydown', modal._bmsKeyHandler);
            }

            // Restore focus
            if (modal._previousFocus) {
                modal._previousFocus.focus();
            }

            // Animate out
            if (config.animation) {
                overlay.classList.add('bms-modal-closing');
                modal.classList.add('bms-modal-closing');
                setTimeout(() => overlay.remove(), 300);
            } else {
                overlay.remove();
            }
        },

        /**
         * Close all modals
         */
        closeAll: function() {
            [...this.activeModals].forEach(modal => this.close(modal));
        },

        /**
         * Create a confirmation modal
         */
        confirm: function(options = {}) {
            const defaults = {
                title: 'Confirm',
                message: 'Are you sure?',
                confirmText: 'Confirm',
                cancelText: 'Cancel',
                confirmType: 'primary',
                onConfirm: null,
                onCancel: null
            };

            const config = { ...defaults, ...options };

            return this.create({
                title: config.title,
                content: `<p>${config.message}</p>`,
                size: 'small',
                buttons: [
                    {
                        text: config.cancelText,
                        type: 'default',
                        action: config.onCancel
                    },
                    {
                        text: config.confirmText,
                        type: config.confirmType,
                        action: config.onConfirm
                    }
                ]
            });
        },

        /**
         * Create an alert modal
         */
        alert: function(options = {}) {
            const defaults = {
                title: 'Alert',
                message: 'Alert message',
                buttonText: 'OK',
                type: 'info', // info, success, warning, danger
                onClose: null
            };

            const config = { ...defaults, ...options };

            return this.create({
                title: config.title,
                content: `<div class="bms-modal-alert bms-modal-alert-${config.type}">
                    <p>${config.message}</p>
                </div>`,
                size: 'small',
                buttons: [
                    {
                        text: config.buttonText,
                        type: 'primary',
                        action: config.onClose
                    }
                ]
            });
        },

        /**
         * Create a prompt modal
         */
        prompt: function(options = {}) {
            const defaults = {
                title: 'Input',
                message: 'Please enter a value:',
                placeholder: '',
                defaultValue: '',
                inputType: 'text',
                submitText: 'Submit',
                cancelText: 'Cancel',
                onSubmit: null,
                onCancel: null,
                validation: null
            };

            const config = { ...defaults, ...options };
            const inputId = 'prompt-input-' + Date.now();

            const content = document.createElement('div');
            content.innerHTML = `
                <p>${config.message}</p>
                <input
                    id="${inputId}"
                    type="${config.inputType}"
                    class="bms-modal-input"
                    placeholder="${config.placeholder}"
                    value="${config.defaultValue}"
                />
                <div class="bms-modal-error" style="display: none;"></div>
            `;

            const modal = this.create({
                title: config.title,
                content: content,
                size: 'small',
                buttons: [
                    {
                        text: config.cancelText,
                        type: 'default',
                        action: () => {
                            if (config.onCancel) config.onCancel();
                        }
                    },
                    {
                        text: config.submitText,
                        type: 'primary',
                        action: (modal) => {
                            const input = modal.querySelector(`#${inputId}`);
                            const value = input.value;
                            const errorDiv = modal.querySelector('.bms-modal-error');

                            if (config.validation) {
                                const error = config.validation(value);
                                if (error) {
                                    errorDiv.textContent = error;
                                    errorDiv.style.display = 'block';
                                    input.classList.add('bms-modal-input-error');
                                    return false;
                                }
                            }

                            if (config.onSubmit) {
                                config.onSubmit(value);
                            }
                        },
                        closeOnClick: false
                    }
                ]
            });

            // Focus input
            setTimeout(() => {
                const input = modal.querySelector(`#${inputId}`);
                if (input) {
                    input.focus();
                    input.select();
                }
            }, 100);

            return modal;
        }
    };
})();