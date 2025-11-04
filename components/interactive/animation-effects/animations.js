/**
 * Advanced Animation Effects Library for BMS
 * World-class animations with smooth transitions and sophisticated effects
 */

(function() {
    // Extend BMS.UI namespace
    if (!window.BMS) window.BMS = {};
    if (!window.BMS.UI) window.BMS.UI = {};
    if (!window.BMS.UI.Animations) window.BMS.UI.Animations = {};

    BMS.UI.Animations = {
        /**
         * Check if user prefers reduced motion
         */
        prefersReducedMotion: function() {
            return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        },

        /**
         * Fade In effect with multiple variants
         */
        fadeIn: function(element, options = {}) {
            if (this.prefersReducedMotion() && !options.force) {
                element.style.opacity = '1';
                return Promise.resolve();
            }

            const defaults = {
                duration: 300,
                delay: 0,
                easing: 'ease-out',
                from: 0,
                to: 1,
                onComplete: null
            };

            const config = { ...defaults, ...options };

            return new Promise((resolve) => {
                element.style.transition = `opacity ${config.duration}ms ${config.easing} ${config.delay}ms`;
                element.style.opacity = config.from.toString();

                // Force reflow
                element.offsetHeight;

                element.style.opacity = config.to.toString();

                setTimeout(() => {
                    element.style.transition = '';
                    if (config.onComplete) config.onComplete();
                    resolve();
                }, config.duration + config.delay);
            });
        },

        /**
         * Fade Out effect
         */
        fadeOut: function(element, options = {}) {
            return this.fadeIn(element, { ...options, from: 1, to: 0 });
        },

        /**
         * Slide effect with direction
         */
        slide: function(element, direction = 'down', options = {}) {
            if (this.prefersReducedMotion() && !options.force) {
                element.style.transform = 'none';
                element.style.opacity = '1';
                return Promise.resolve();
            }

            const defaults = {
                duration: 400,
                delay: 0,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                distance: 30,
                fade: true,
                onComplete: null
            };

            const config = { ...defaults, ...options };

            const transforms = {
                down: `translateY(-${config.distance}px)`,
                up: `translateY(${config.distance}px)`,
                left: `translateX(${config.distance}px)`,
                right: `translateX(-${config.distance}px)`
            };

            return new Promise((resolve) => {
                const properties = ['transform'];
                if (config.fade) properties.push('opacity');

                element.style.transition = properties
                    .map(prop => `${prop} ${config.duration}ms ${config.easing} ${config.delay}ms`)
                    .join(', ');

                element.style.transform = transforms[direction];
                if (config.fade) element.style.opacity = '0';

                // Force reflow
                element.offsetHeight;

                element.style.transform = 'translateX(0) translateY(0)';
                if (config.fade) element.style.opacity = '1';

                setTimeout(() => {
                    element.style.transition = '';
                    if (config.onComplete) config.onComplete();
                    resolve();
                }, config.duration + config.delay);
            });
        },

        /**
         * Scale effect with bounce
         */
        scale: function(element, options = {}) {
            if (this.prefersReducedMotion() && !options.force) {
                element.style.transform = 'scale(1)';
                element.style.opacity = '1';
                return Promise.resolve();
            }

            const defaults = {
                duration: 500,
                delay: 0,
                easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Bounce
                from: 0.8,
                to: 1,
                fade: true,
                onComplete: null
            };

            const config = { ...defaults, ...options };

            return new Promise((resolve) => {
                const properties = ['transform'];
                if (config.fade) properties.push('opacity');

                element.style.transition = properties
                    .map(prop => `${prop} ${config.duration}ms ${config.easing} ${config.delay}ms`)
                    .join(', ');

                element.style.transform = `scale(${config.from})`;
                if (config.fade) element.style.opacity = '0';

                // Force reflow
                element.offsetHeight;

                element.style.transform = `scale(${config.to})`;
                if (config.fade) element.style.opacity = '1';

                setTimeout(() => {
                    element.style.transition = '';
                    if (config.onComplete) config.onComplete();
                    resolve();
                }, config.duration + config.delay);
            });
        },

        /**
         * Bounce effect
         */
        bounce: function(element, options = {}) {
            if (this.prefersReducedMotion() && !options.force) {
                return Promise.resolve();
            }

            const defaults = {
                duration: 600,
                intensity: 20,
                onComplete: null
            };

            const config = { ...defaults, ...options };

            return new Promise((resolve) => {
                element.style.animation = `bms-bounce ${config.duration}ms ease-out`;

                // Inject keyframes if not already present
                if (!document.querySelector('#bms-bounce-keyframes')) {
                    const style = document.createElement('style');
                    style.id = 'bms-bounce-keyframes';
                    style.innerHTML = `
                        @keyframes bms-bounce {
                            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                            40% { transform: translateY(-${config.intensity}px); }
                            60% { transform: translateY(-${config.intensity / 2}px); }
                        }
                    `;
                    document.head.appendChild(style);
                }

                setTimeout(() => {
                    element.style.animation = '';
                    if (config.onComplete) config.onComplete();
                    resolve();
                }, config.duration);
            });
        },

        /**
         * Pulse effect
         */
        pulse: function(element, options = {}) {
            if (this.prefersReducedMotion() && !options.force) {
                return Promise.resolve();
            }

            const defaults = {
                duration: 1000,
                scale: 1.05,
                iterations: 1,
                onComplete: null
            };

            const config = { ...defaults, ...options };

            return new Promise((resolve) => {
                element.style.animation = `bms-pulse ${config.duration}ms ease-in-out ${config.iterations}`;

                // Inject keyframes if not already present
                if (!document.querySelector('#bms-pulse-keyframes')) {
                    const style = document.createElement('style');
                    style.id = 'bms-pulse-keyframes';
                    style.innerHTML = `
                        @keyframes bms-pulse {
                            0%, 100% { transform: scale(1); opacity: 1; }
                            50% { transform: scale(${config.scale}); opacity: 0.8; }
                        }
                    `;
                    document.head.appendChild(style);
                }

                setTimeout(() => {
                    element.style.animation = '';
                    if (config.onComplete) config.onComplete();
                    resolve();
                }, config.duration * config.iterations);
            });
        },

        /**
         * Shake effect
         */
        shake: function(element, options = {}) {
            if (this.prefersReducedMotion() && !options.force) {
                return Promise.resolve();
            }

            const defaults = {
                duration: 500,
                intensity: 5,
                onComplete: null
            };

            const config = { ...defaults, ...options };

            return new Promise((resolve) => {
                element.style.animation = `bms-shake ${config.duration}ms ease-in-out`;

                // Inject keyframes if not already present
                if (!document.querySelector('#bms-shake-keyframes')) {
                    const style = document.createElement('style');
                    style.id = 'bms-shake-keyframes';
                    style.innerHTML = `
                        @keyframes bms-shake {
                            0%, 100% { transform: translateX(0); }
                            10%, 30%, 50%, 70%, 90% { transform: translateX(-${config.intensity}px); }
                            20%, 40%, 60%, 80% { transform: translateX(${config.intensity}px); }
                        }
                    `;
                    document.head.appendChild(style);
                }

                setTimeout(() => {
                    element.style.animation = '';
                    if (config.onComplete) config.onComplete();
                    resolve();
                }, config.duration);
            });
        },

        /**
         * Ripple effect (Material Design inspired)
         */
        ripple: function(element, event, options = {}) {
            if (this.prefersReducedMotion() && !options.force) {
                return Promise.resolve();
            }

            const defaults = {
                duration: 600,
                color: 'rgba(255, 255, 255, 0.5)',
                size: null,
                onComplete: null
            };

            const config = { ...defaults, ...options };

            return new Promise((resolve) => {
                const rect = element.getBoundingClientRect();
                const size = config.size || Math.max(rect.width, rect.height);

                // Calculate position
                let x = rect.width / 2;
                let y = rect.height / 2;

                if (event && event.clientX) {
                    x = event.clientX - rect.left;
                    y = event.clientY - rect.top;
                }

                // Create ripple element
                const ripple = document.createElement('span');
                ripple.className = 'bms-ripple';
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: ${config.color};
                    pointer-events: none;
                    width: ${size * 2}px;
                    height: ${size * 2}px;
                    left: ${x - size}px;
                    top: ${y - size}px;
                    transform: scale(0);
                    opacity: 1;
                    transition: transform ${config.duration}ms ease-out, opacity ${config.duration}ms ease-out;
                `;

                // Ensure element has position
                const position = window.getComputedStyle(element).position;
                if (position === 'static') {
                    element.style.position = 'relative';
                }
                element.style.overflow = 'hidden';

                element.appendChild(ripple);

                // Force reflow
                ripple.offsetHeight;

                // Animate
                ripple.style.transform = 'scale(1)';
                ripple.style.opacity = '0';

                setTimeout(() => {
                    ripple.remove();
                    if (config.onComplete) config.onComplete();
                    resolve();
                }, config.duration);
            });
        },

        /**
         * Morph effect - transform one element into another
         */
        morph: function(fromElement, toElement, options = {}) {
            if (this.prefersReducedMotion() && !options.force) {
                fromElement.style.opacity = '0';
                toElement.style.opacity = '1';
                return Promise.resolve();
            }

            const defaults = {
                duration: 800,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                onComplete: null
            };

            const config = { ...defaults, ...options };

            return new Promise((resolve) => {
                const fromRect = fromElement.getBoundingClientRect();
                const toRect = toElement.getBoundingClientRect();

                // Calculate transform values
                const scaleX = toRect.width / fromRect.width;
                const scaleY = toRect.height / fromRect.height;
                const translateX = toRect.left - fromRect.left;
                const translateY = toRect.top - fromRect.top;

                // Apply transition to from element
                fromElement.style.transition = `transform ${config.duration}ms ${config.easing}, opacity ${config.duration}ms ${config.easing}`;
                fromElement.style.transformOrigin = 'top left';

                // Initially hide to element
                toElement.style.opacity = '0';
                toElement.style.transition = `opacity ${config.duration}ms ${config.easing}`;

                // Force reflow
                fromElement.offsetHeight;

                // Animate
                fromElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
                fromElement.style.opacity = '0';

                setTimeout(() => {
                    toElement.style.opacity = '1';
                }, config.duration / 2);

                setTimeout(() => {
                    fromElement.style.transition = '';
                    fromElement.style.transform = '';
                    toElement.style.transition = '';
                    if (config.onComplete) config.onComplete();
                    resolve();
                }, config.duration);
            });
        },

        /**
         * Stagger animation for multiple elements
         */
        stagger: function(elements, animationType, options = {}) {
            const defaults = {
                staggerDelay: 50,
                ...options
            };

            const promises = Array.from(elements).map((element, index) => {
                const elementOptions = {
                    ...defaults,
                    delay: (defaults.delay || 0) + (index * defaults.staggerDelay)
                };

                return this[animationType](element, elementOptions);
            });

            return Promise.all(promises);
        },

        /**
         * Parallax scrolling effect
         */
        parallax: function(element, options = {}) {
            const defaults = {
                speed: 0.5,
                offset: 0,
                onScroll: null
            };

            const config = { ...defaults, ...options };

            const handleScroll = () => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * config.speed * -1;
                element.style.transform = `translateY(${rate + config.offset}px)`;

                if (config.onScroll) {
                    config.onScroll(scrolled, rate);
                }
            };

            window.addEventListener('scroll', handleScroll);

            // Return cleanup function
            return () => {
                window.removeEventListener('scroll', handleScroll);
            };
        }
    };
})();