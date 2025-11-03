/**
 * Enhanced Twitter Media Analyzer
 * ==============================
 * Advanced tool for detecting, organizing, and downloading Twitter media content
 * with support for both videos and images, minimizable interface, and direct download links.
 * 
 * Version 2.1.1 - Fixed duplicate methods, added missing functionality, improved error handling
 */

class EnhancedTwitterMediaAnalyzer {
  constructor(config = {}) {
    // Default configuration
    this.config = {
      // Scrolling parameters
      scrollDistance: 1500,         // Pixels to scroll each time
      scrollDelay: 5500,            // Milliseconds between scrolls
      maxScrollAttempts: 300,       // Maximum number of scroll attempts
      stabilityThreshold: 8,        // Stop after N scrolls with no new content
      
      // Content detection
      detectVideos: true,           // Detect videos
      detectImages: true,           // Detect images (photos)
      includeReplies: true,         // Include media in reply tweets
      includeRetweets: true,        // Include media in retweets
      
      // Processing parameters
      immediateExtraction: true,    // Extract data immediately when found
      detectRemovals: true,         // Track when Twitter removes content
      minVideoDuration: 0,          // Minimum video duration in seconds (0 = no minimum)
      updateUIOnNewContent: true,   // Update UI when new content is found
      
      // Media quality options
      preferredVideoQuality: 'highest', // 'highest', 'high', 'medium', 'low'
      preferredImageQuality: 'orig',    // 'orig', 'large', 'medium', 'small'
      convertGifToMp4: true,           // Convert GIFs to MP4 for better quality
      
      // UI parameters
      darkMode: true,               // Use dark mode UI
      debugMode: true,              // Show debug console
      defaultTab: 'videos',         // Default tab to show ('videos', 'images', 'stats')
      minimizedPosition: 'bottom-right', // Position when minimized
      useVirtualScroll: true,       // Use virtual scrolling for large result sets
      itemsPerPage: 50,             // Number of items to show per page
      
      // Keyboard shortcuts (can be customized)
      shortcuts: {
        toggleAnalyzer: 'Alt+A',    // Toggle analyzer visibility
        startStop: 'Alt+S',         // Start/stop analysis
        minimize: 'Alt+M',          // Minimize/maximize
        nextTab: 'Alt+Right',       // Switch to next tab
        prevTab: 'Alt+Left',        // Switch to previous tab
        copyUrls: 'Alt+C',          // Copy URLs of current tab
        download: 'Alt+D',          // Download media from current tab
        filter: 'Alt+F',            // Focus search/filter input
        help: '?'                   // Show keyboard shortcuts help
      },
      
      // Cache limits
      maxCacheSize: 10000,          // Maximum number of items to store in cache
      
      // Error handling
      ignorePwaErrors: true,        // Ignore Twitter PWA-related errors
      retryFailedRequests: true,    // Retry failed API requests
      maxRetries: 3,                // Maximum number of retries for failed requests
      
      // Accessibility
      enableA11y: true,             // Enable accessibility features
      highContrast: false,          // Use high contrast mode
      reducedMotion: false,         // Respect prefers-reduced-motion
      
      // Export options
      batchSize: 100,               // Number of items to process in each export batch
      showProgress: true,           // Show progress during exports
      
      ...config // Override with user provided config
    };
    
    // State management
    this.state = {
      isProcessing: false,
      isScrolling: false,
      isMinimized: false,
      isFullscreen: false,         // Track fullscreen state
      currentTab: this.config.defaultTab,
      scrollCount: 0,
      stabilityCounter: 0,
      startTime: null,
      endTime: null,
      
      // Media caches (persistent)
      videoCache: new Map(),        // Map of URL -> video data
      imageCache: new Map(),        // Map of URL -> image data
      domElements: new Set(),       // Set of DOM elements currently in view
      
      // UI state
      currentPage: 1,               // Current page for virtual scrolling
      searchQuery: '',              // Current search/filter query
      sortOrder: 'newest',          // Current sort order
      selectedItems: new Set(),     // Selected items for batch operations
      
      // Stats
      newlyDiscoveredVideos: 0,
      newlyDiscoveredImages: 0,
      domRemoved: 0,
      lastMediaDiscoveryScroll: 0,
      
      // Export progress
      isExporting: false,
      exportProgress: 0,
      exportTotal: 0,
      
      // Throttling
      lastScrollTime: 0,
      lastDetectionTime: 0,
      
      // Error tracking
      errors: {
        pwa: 0,
        api: 0,
        network: 0,
        retry: {
          count: 0,
          lastError: null,
          timestamp: null
        }
      },
    };
    
    // UI elements
    this.ui = {};
    
    // Define colors based on theme
    this.initializeColors();
    
    // Flag to track active state
    this.isActive = true;
    this.isAnalyzing = false;
    
    // Bind methods
    this.bindMethods();
    
    // Initialize
    this.initializeKeyboardShortcuts();
    this.initializeErrorHandlers();
    this.initializeAccessibility();
  }
  
  /**
   * Initialize color scheme based on theme setting
   */
  initializeColors() {
    const isDark = this.config.darkMode;
    this.colors = {
      background: isDark ? '#15202b' : '#ffffff',
      text: isDark ? '#ffffff' : '#0f1419',
      secondary: isDark ? '#8899a6' : '#536471',
      border: isDark ? '#38444d' : '#eff3f4',
      card: isDark ? '#192734' : '#f7f9fa',
      primary: '#1d9bf0',
      success: '#00ba7c',
      warning: '#ffad1f',
      error: '#f4212e'
    };
  }
  
  /**
   * Log message to console and optionally to UI
   * @param {string} message - The message to log
   * @param {string} level - Log level: 'info', 'success', 'warning', 'error'
   */
  log(message, level = 'info') {
    // Define colors for different log levels
    const logColors = {
      info: '#1d9bf0',    // Blue
      success: '#00ba7c', // Green
      warning: '#ffad1f', // Orange
      error: '#f4212e'    // Red
    };
    
    // Get timestamp
    const timestamp = new Date().toLocaleTimeString();
    
    // Format message for console
    const formattedMessage = `[TMA ${timestamp}] ${message}`;
    
    // Log to console with appropriate level
    switch (level) {
      case 'success':
        console.log(`%c${formattedMessage}`, `color: ${logColors.success}`);
        break;
      case 'warning':
        console.warn(`%c${formattedMessage}`, `color: ${logColors.warning}`);
        break;
      case 'error':
        console.error(`%c${formattedMessage}`, `color: ${logColors.error}`);
        break;
      default:
        console.log(`%c${formattedMessage}`, `color: ${logColors.info}`);
    }
    
    // Update UI status if available
    this.updateStatus(message, level);
  }
  
  /**
   * Update status message in UI
   * @param {string} message - Status message to display
   * @param {string} level - Message level: 'info', 'success', 'warning', 'error'
   */
  updateStatus(message, level = 'info') {
    const statusElement = document.querySelector('.twitter-media-analyzer-status');
    if (!statusElement) return;
    
    // Clear any existing status classes
    statusElement.className = 'twitter-media-analyzer-status';
    
    // Add status level class
    statusElement.classList.add(`status-${level}`);
    
    // Set status text
    statusElement.textContent = message;
    
    // Set status color based on level
    switch (level) {
      case 'success':
        statusElement.style.color = this.colors?.success || '#00ba7c';
        break;
      case 'warning':
        statusElement.style.color = this.colors?.warning || '#ffad1f';
        break;
      case 'error':
        statusElement.style.color = this.colors?.error || '#f4212e';
        break;
      default:
        statusElement.style.color = this.colors?.text || '#ffffff';
    }
  }
  
  /**
   * Generate a unique ID for a media item
   * @param {string} url - URL or identifier
   * @param {string} secondaryId - Secondary identifier (like media URL)
   * @returns {string} - Unique identifier
   */
  generateUniqueId(url, secondaryId) {
    // Combine the URLs and create a hash
    const combinedString = `${url || ''}::${secondaryId || ''}::${Date.now()}`;
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < combinedString.length; i++) {
      const char = combinedString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Return string representation with prefix
    return `tma_${Math.abs(hash).toString(16)}`;
  }
  
  /**
   * Bind all class methods to maintain proper 'this' context
   * @private
   */
  bindMethods() {
    // Get all method names from the prototype
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter(name => typeof this[name] === 'function' && name !== 'constructor');
    
    // Bind each method
    methods.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }
  
  /**
   * Initialize keyboard shortcuts
   * @private
   */
  initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      // Only handle if analyzer is active
      if (!this.isActive) {
        return;
      }
      
      // Don't handle if typing in an input
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }
      
      const shortcuts = {
        // Toggle analyzer
        't': () => this.toggle(),
        
        // Start/stop analysis
        's': () => {
          if (this.isAnalyzing) {
            this.stop();
          } else {
            this.start();
          }
        },
        
        // Minimize/maximize
        'm': () => this.toggleMinimize(),
        
        // Switch tabs
        '1': () => this.switchTab('videos'),
        '2': () => this.switchTab('images'),
        
        // Copy URLs of selected items
        'c': () => {
          if (event.ctrlKey || event.metaKey) {
            this.copySelectedUrls();
          }
        },
        
        // Download selected items
        'd': () => {
          if (event.ctrlKey || event.metaKey) {
            const items = Array.from(this.state.selectedItems).map(id => 
              this.state.videoCache.get(id) || this.state.imageCache.get(id)
            ).filter(Boolean);
            
            this.batchDownload(items);
          }
        },
        
        // Focus search
        'f': () => {
          if (event.ctrlKey || event.metaKey) {
            const searchInput = document.querySelector('.twitter-media-analyzer input[type="text"]');
            if (searchInput) {
              searchInput.focus();
            }
          }
        },
        
        // Show help
        '?': () => this.showKeyboardShortcuts()
      };
      
      const shortcut = shortcuts[event.key.toLowerCase()];
      if (shortcut) {
        event.preventDefault();
        shortcut();
      }
    });
  }
  
  /**
   * Get standardized key combo string from keyboard event
   * @private
   * @param {KeyboardEvent} event - Keyboard event
   * @returns {string} - Standardized key combo (e.g., "Alt+A")
   */
  getKeyCombo(event) {
    const modifiers = [];
    if (event.altKey) modifiers.push('Alt');
    if (event.ctrlKey) modifiers.push('Ctrl');
    if (event.metaKey) modifiers.push('Meta');
    if (event.shiftKey) modifiers.push('Shift');
    
    const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
    return [...modifiers, key].join('+');
  }
  
  /**
   * Initialize accessibility features
   * @private
   */
  initializeAccessibility() {
    if (!this.config.enableA11y) return;
    
    // Observe system preferences
    if (window.matchMedia) {
      // Dark mode preference
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      try {
        // Modern approach
        darkModeQuery.addEventListener('change', (e) => {
          if (this.config.darkMode === 'auto') {
            this.updateTheme(e.matches);
          }
        });
      } catch (e) {
        // Fallback for older browsers
        darkModeQuery.addListener((e) => {
          if (this.config.darkMode === 'auto') {
            this.updateTheme(e.matches);
          }
        });
      }
      
      // Reduced motion preference
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      try {
        motionQuery.addEventListener('change', (e) => {
          this.config.reducedMotion = e.matches;
          this.updateAnimations();
        });
      } catch (e) {
        motionQuery.addListener((e) => {
          this.config.reducedMotion = e.matches;
          this.updateAnimations();
        });
      }
      
      // High contrast preference
      const contrastQuery = window.matchMedia('(prefers-contrast: more)');
      try {
        contrastQuery.addEventListener('change', (e) => {
          this.config.highContrast = e.matches;
          this.updateContrast();
        });
      } catch (e) {
        contrastQuery.addListener((e) => {
          this.config.highContrast = e.matches;
          this.updateContrast();
        });
      }
    }
  }
  
  /**
   * Update theme based on dark mode setting
   * @param {boolean} isDark - Whether to use dark mode
   */
  updateTheme(isDark) {
    this.config.darkMode = isDark;
    this.initializeColors();
    // Recreate UI with new colors
    if (this.ui.overlay) {
      this.createInterface();
    }
  }
  
  /**
   * Update animations based on reduced motion setting
   */
  updateAnimations() {
    // Implementation of reduced motion settings
    if (!document.querySelector('#tma-reduced-motion') && this.config.reducedMotion) {
      const style = document.createElement('style');
      style.id = 'tma-reduced-motion';
      style.textContent = `
        .twitter-media-analyzer * {
          transition: none !important;
          animation: none !important;
        }
      `;
      document.head.appendChild(style);
    } else if (document.querySelector('#tma-reduced-motion') && !this.config.reducedMotion) {
      const style = document.querySelector('#tma-reduced-motion');
      if (style && style.parentNode) {
        style.parentNode.removeChild(style);
      }
    }
  }
  
  /**
   * Update contrast based on high contrast setting
   */
  updateContrast() {
    if (this.config.highContrast) {
      this.colors = {
        ...this.colors,
        primary: '#0066cc',
        secondary: '#595959',
        border: '#404040',
        text: '#000000',
      };
    } else {
      this.initializeColors();
    }
    
    // Update UI if it exists
    if (this.ui.overlay) {
      this.createInterface();
    }
  }
  
  /**
   * Initialize error handlers to intercept various types of errors
   * @private
   */
  initializeErrorHandlers() {
    if (this.config.ignorePwaErrors) {
      // Intercept console errors
      const originalConsoleError = console.error;
      console.error = (...args) => {
        const errorString = args.join(' ');
        if (this.shouldIgnoreError(errorString)) {
          this.state.errors.pwa++;
          return; // Suppress error
        }
        originalConsoleError.apply(console, args);
      };

      // Intercept window errors
      window.addEventListener('error', (event) => {
        if (this.shouldIgnoreError(event.error?.message || event.message)) {
          event.preventDefault();
          event.stopPropagation();
          this.state.errors.pwa++;
          return false;
        }
      }, true);

      // Intercept unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        if (this.shouldIgnoreError(event.reason?.message || event.reason)) {
          event.preventDefault();
          event.stopPropagation();
          this.state.errors.pwa++;
          return false;
        }
      }, true);

      // Patch fetch to intercept PWA-related requests
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        try {
          const response = await originalFetch(...args);
          if (this.isPwaRequest(args[0]?.toString() || '')) {
            return new Response('{}', { status: 200 }); // Mock success
          }
          return response;
        } catch (error) {
          if (this.shouldIgnoreError(error.message)) {
            this.state.errors.pwa++;
            return new Response('{}', { status: 200 }); // Mock success
          }
          throw error;
        }
      };
    }
  }

  /**
   * Check if an error should be ignored
   * @private
   * @param {string} errorString - Error message or URL
   * @returns {boolean} - True if error should be ignored
   */
  shouldIgnoreError(errorString) {
    const ignoredPatterns = [
      'hasLaunchedPWA',
      'lockdown-install',
      'Removing unpermitted intrinsics',
      'strato/column/User',
      '/onboarding/',
      'api/1.1/strato',
      'x.com/i/api'
    ];

    return ignoredPatterns.some(pattern => 
      errorString?.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Check if a request is PWA-related
   * @private
   * @param {string} url - Request URL
   * @returns {boolean} - True if request is PWA-related
   */
  isPwaRequest(url) {
    const pwaPatterns = [
      'hasLaunchedPWA',
      'onboarding',
      'strato/column/User'
    ];

    return pwaPatterns.some(pattern => 
      url.toLowerCase().includes(pattern.toLowerCase())
    );
  }
  
  /**
   * Check if we are currently on Twitter/X
   * @returns {boolean} - True if on Twitter/X
   */
  isOnTwitter() {
    const hostname = window.location.hostname;
    return hostname.includes('twitter.com') || 
           hostname.includes('x.com') || 
           hostname.includes('twimg.com');
  }
  
  /**
   * Throttle function to limit how often a function can be called
   * @param {Function} fn - Function to throttle
   * @param {number} delay - Delay in ms
   * @returns {Function} - Throttled function
   */
  throttle(fn, delay) {
    let lastTime = 0;
    return function(...args) {
      const now = new Date().getTime();
      if (now - lastTime >= delay) {
        fn.apply(this, args);
        lastTime = now;
      }
    };
  }
  
  /**
   * Check cache size and trim if needed
   */
  checkCacheSize() {
    // Check video cache size
    if (this.state.videoCache.size > this.config.maxCacheSize) {
      this.log(`Video cache exceeded limit (${this.state.videoCache.size}). Trimming to ${this.config.maxCacheSize} items.`, 'warning');
      
      // Convert to array, sort by duration (keep longest videos)
      const videos = Array.from(this.state.videoCache.entries())
        .sort((a, b) => b[1].durationSeconds - a[1].durationSeconds)
        .slice(0, this.config.maxCacheSize);
      
      // Rebuild cache
      this.state.videoCache = new Map(videos);
    }
    
    // Check image cache size
    if (this.state.imageCache.size > this.config.maxCacheSize) {
      this.log(`Image cache exceeded limit (${this.state.imageCache.size}). Trimming to ${this.config.maxCacheSize} items.`, 'warning');
      
      // Convert to array, sort by discovery (keep newest)
      const images = Array.from(this.state.imageCache.entries())
        .sort((a, b) => b[1].discoveredAtScroll - a[1].discoveredAtScroll)
        .slice(0, this.config.maxCacheSize);
      
      // Rebuild cache
      this.state.imageCache = new Map(images);
    }
  }
  
  /**
   * Toggle the analyzer interface minimized state
   */
  toggleMinimize() {
    this.state.isMinimized = !this.state.isMinimized;
    this.createInterface();
  }
  
  /**
   * Toggle the analyzer (show/hide)
   */
  toggle() {
    this.isActive = !this.isActive;
    
    const overlay = document.querySelector('#twitter-media-analyzer');
    if (overlay) {
      overlay.style.display = this.isActive ? 'block' : 'none';
    } else if (this.isActive) {
      this.createInterface();
    }
  }
  
  /**
   * Start analysis process
   */
  start() {
    this.isAnalyzing = true;
    this.startAnalysis();
  }
  
  /**
   * Stop analysis process
   */
  stop() {
    this.isAnalyzing = false;
    this.state.isScrolling = false;
    this.state.isProcessing = false;
    this.updateStatus('Analysis stopped. Click Start/Resume to continue.', 'warning');
  }
  
  /**
   * Show keyboard shortcuts help
   */
  showKeyboardShortcuts() {
    // Create a modal with keyboard shortcuts
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10001;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: ${this.colors.background};
      color: ${this.colors.text};
      padding: 20px;
      border-radius: 8px;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    content.innerHTML = `
      <h2 style="margin-top: 0;">Keyboard Shortcuts</h2>
      <table style="width:100%; border-collapse: collapse;">
        <tr>
          <th style="text-align: left; padding: 8px; border-bottom: 1px solid ${this.colors.border};">Action</th>
          <th style="text-align: left; padding: 8px; border-bottom: 1px solid ${this.colors.border};">Shortcut</th>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid ${this.colors.border};">Toggle Analyzer</td>
          <td style="padding: 8px; border-bottom: 1px solid ${this.colors.border};">T</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid ${this.colors.border};">Start/Stop Analysis</td>
          <td style="padding: 8px; border-bottom: 1px solid ${this.colors.border};">S</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid ${this.colors.border};">Minimize/Maximize</td>
          <td style="padding: 8px; border-bottom: 1px solid ${this.colors.border};">M</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid ${this.colors.border};">Videos Tab</td>
          <td style="padding: 8px; border-bottom: 1px solid ${this.colors.border};">1</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid ${this.colors.border};">Images Tab</td>
          <td style="padding: 8px; border-bottom: 1px solid ${this.colors.border};">2</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid ${this.colors.border};">Copy Selected URLs</td>
          <td style="padding: 8px; border-bottom: 1px solid ${this.colors.border};">Ctrl/Cmd + C</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid ${this.colors.border};">Download Selected</td>
          <td style="padding: 8px; border-bottom: 1px solid ${this.colors.border};">Ctrl/Cmd + D</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid ${this.colors.border};">Focus Search</td>
          <td style="padding: 8px; border-bottom: 1px solid ${this.colors.border};">Ctrl/Cmd + F</td>
        </tr>
        <tr>
          <td style="padding: 8px;">Show This Help</td>
          <td style="padding: 8px;">?</td>
        </tr>
      </table>
      <div style="margin-top: 20px; text-align: center;">
        <button id="close-shortcuts" style="
          padding: 8px 16px;
          background: ${this.colors.primary};
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        ">Close</button>
      </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Close on button click or outside click
    document.getElementById('close-shortcuts').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }
  
  /**
   * Download a batch of media items
   * @param {Array} items - Array of media items to download
   */
  batchDownload(items) {
    if (!items || items.length === 0) {
      this.log('No items selected for download', 'warning');
      return;
    }
    
    this.log(`Starting batch download of ${items.length} items`, 'info');
    
    // Create download links for each item in sequence
    let index = 0;
    const downloadNext = () => {
      if (index >= items.length) {
        this.log('Batch download complete', 'success');
        return;
      }
      
      const item = items[index];
      const downloadUrl = item.downloadUrl || item.url;
      
      if (!downloadUrl) {
        this.log(`Item #${index + 1} has no download URL, skipping`, 'warning');
        index++;
        downloadNext();
        return;
      }
      
      // Create a temporary link for download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `twitter-media-${item.id}`;
      a.target = '_blank';
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Update progress
      if (this.config.showProgress) {
        this.updateStatus(`Downloading ${index + 1} of ${items.length}...`, 'info');
      }
      
      // Add delay between downloads to avoid browser limiting
      setTimeout(() => {
        index++;
        downloadNext();
      }, 500);
    };
    
    // Start the download process
    downloadNext();
  }
  
  /**
   * Start the media analysis process
   */
  async startAnalysis() {
    // If currently processing, stop first
    if (this.state.isProcessing) {
      this.state.isScrolling = false;
      this.state.isProcessing = false;
      this.updateStatus('Analysis stopped. Click Start/Resume to continue.', 'warning');
      return;
    }
    
    try {
      // Initialize state
      this.state.isProcessing = true;
      this.state.isScrolling = true;
      
      // Only set start time if this is a fresh start
      if (!this.state.startTime) {
        this.state.startTime = performance.now();
      }
      
      // Create or update UI
      this.createInterface();
      this.updateStatus('Initializing Twitter Media Analyzer...');
      
      // Check if we're on Twitter/X
      if (!this.isOnTwitter()) {
        this.updateStatus('Not on Twitter/X. Please navigate to Twitter/X before running the analyzer.', 'error');
        this.state.isProcessing = false;
        this.state.isScrolling = false;
        return;
      }
      
      // Initial detection
      this.log('Performing initial media detection...', 'info');
      this.detectMedia();
      
      const initialVideos = this.state.videoCache.size;
      const initialImages = this.state.imageCache.size;
      
      // Begin infinite scroll
      this.updateStatus(`Beginning infinite scroll process. Found ${initialVideos} videos and ${initialImages} images initially.`);
      await this.infiniteScroll();
      
      // Complete processing
      if (!this.state.isScrolling) {
        this.updateStatus('Analysis paused. Click Start/Resume to continue.', 'warning');
        return;
      }
      
      this.state.endTime = performance.now();
      const duration = ((this.state.endTime - this.state.startTime) / 1000).toFixed(1);
      
      const totalVideos = this.state.videoCache.size;
      const totalImages = this.state.imageCache.size;
      const totalMedia = totalVideos + totalImages;
      
      this.updateStatus(`Analysis complete in ${duration}s! Found ${totalVideos} videos and ${totalImages} images.`, 'success');
      this.log(`Analysis completed. Total scrolls: ${this.state.scrollCount}`, 'success');
      this.log(`Total media found: ${totalMedia} (${totalVideos} videos, ${totalImages} images)`, 'success');
      
      // Display results
      this.displayResults();
      
    } catch (error) {
      this.log(`Error during analysis: ${error.message}`, 'error');
      this.updateStatus(`Error: ${error.message}`, 'error');
      console.error(error);
    } finally {
      this.state.isProcessing = false;
      this.state.isScrolling = false;
    }
  }
  
  /**
   * Perform infinite scrolling to load all content
   * @returns {Promise<void>}
   */
  async infiniteScroll() {
    return new Promise((resolve) => {
      this.state.isScrolling = true;
      this.state.scrollCount = 0;
      this.state.stabilityCounter = 0;
      
      // Exponential backoff for scrolling
      let currentDelay = this.config.scrollDelay;
      let consecutiveErrors = 0;
      
      const scrollStep = async () => {
        if (!this.state.isScrolling) {
          this.log('Scrolling stopped', 'info');
          resolve();
          return;
        }
        
        // Check if we've reached max attempts
        if (this.state.scrollCount >= this.config.maxScrollAttempts) {
          this.log(`Reached maximum scroll attempts (${this.config.maxScrollAttempts})`, 'warning');
          this.state.isScrolling = false;
          resolve();
          return;
        }
        
        try {
          // Store counts before scrolling
          const videosCountBefore = this.state.videoCache.size;
          const imagesCountBefore = this.state.imageCache.size;
          const domElementsBefore = this.state.domElements.size;
          
          // Perform scroll with error handling
          try {
            window.scrollBy(0, this.config.scrollDistance);
            this.state.scrollCount++;
            consecutiveErrors = 0; // Reset error counter on success
            currentDelay = this.config.scrollDelay; // Reset delay on success
          } catch (scrollError) {
            consecutiveErrors++;
            this.log(`Scroll error (attempt ${consecutiveErrors}): ${scrollError.message}`, 'error');
            
            // Exponential backoff
            currentDelay = Math.min(currentDelay * 1.5, 10000); // Max 10s delay
            
            if (consecutiveErrors >= 5) {
              throw new Error(`Multiple scroll errors: ${scrollError.message}`);
            }
          }
          
          // Update UI with current progress
          this.updateStatus(`Scrolling: Pass ${this.state.scrollCount} - Found ${videosCountBefore} videos, ${imagesCountBefore} images...`);
          
          // Wait for content to load
          setTimeout(() => {
            try {
              // Detect media after scrolling
              this.detectMedia();
              
              // Calculate detection stats
              const videosCountAfter = this.state.videoCache.size;
              const imagesCountAfter = this.state.imageCache.size;
              const newVideosFound = videosCountAfter - videosCountBefore;
              const newImagesFound = imagesCountAfter - imagesCountBefore;
              const newMediaFound = newVideosFound + newImagesFound;
              
              // Track DOM changes
              const domElementsAfter = this.state.domElements.size;
              const domElementsDiff = domElementsAfter - domElementsBefore;
              
              // Update status with detailed information
              const statusMessage = `Scroll ${this.state.scrollCount}: Found ${newMediaFound} new media items (${newVideosFound} videos, ${newImagesFound} images)`;
              
              // Detailed logging
              if (newMediaFound > 0) {
                this.log(`${statusMessage} (total: ${videosCountAfter + imagesCountAfter})`, 'success');
                this.state.lastMediaDiscoveryScroll = this.state.scrollCount;
                this.state.stabilityCounter = 0;
              } else {
                this.log(`${statusMessage} (stability: ${this.state.stabilityCounter + 1}/${this.config.stabilityThreshold})`, 'info');
                this.state.stabilityCounter++;
              }
              
              // Log DOM element changes
              if (this.config.detectRemovals && domElementsDiff !== 0) {
                this.log(`DOM elements ${domElementsDiff > 0 ? 'added' : 'removed'}: ${Math.abs(domElementsDiff)} (current: ${domElementsAfter})`, 
                  domElementsDiff > 0 ? 'info' : 'warning');
              }
              
              // Check if we should continue scrolling
              if (this.state.stabilityCounter >= this.config.stabilityThreshold) {
                this.log(`Content stabilized after ${this.state.scrollCount} scrolls. No new media found in the last ${this.config.stabilityThreshold} scrolls.`, 'success');
                this.state.isScrolling = false;
                resolve();
              } else {
                // Check cache size before continuing
                this.checkCacheSize();
                
                // Continue scrolling
                scrollStep();
              }
            } catch (detectionError) {
              this.log(`Error during media detection: ${detectionError.message}`, 'error');
              // Continue scrolling despite detection error
              scrollStep();
            }
          }, currentDelay);
        } catch (error) {
          this.log(`Critical error during scrolling: ${error.message}`, 'error');
          this.state.isScrolling = false;
          resolve();
        }
      };
      
      // Start the scrolling process
      scrollStep();
    });
  }
  
  /**
   * Detect media elements on the page and extract data
   */
  detectMedia() {
    try {
      // Find tweet containers first - updated selectors for both main feed and media page
      const tweetContainers = new Set(
        Array.from(document.querySelectorAll(
          'article[data-testid="tweet"], ' +
          'div[data-testid="tweet"], ' +
          'article[role="article"], ' +
          'div[class*="r-1udh08x"]'  // Media page container
        )).filter(el => el instanceof Element)
      );

      if (tweetContainers.size === 0) {
        this.log('No tweet containers found', 'warning');
        return { newVideos: 0, newImages: 0 };
      }

      this.log(`Found ${tweetContainers.size} tweet containers`, 'info');

      // Update tracking of DOM elements
      this.state.domElements = tweetContainers;

      // Process each tweet container
      let newVideosCount = 0;
      let newImagesCount = 0;

      tweetContainers.forEach(container => {
        try {
          // Check exclusion criteria
          if (!this.config.includeReplies && this.isReply(container)) {
            return;
          }
          if (!this.config.includeRetweets && this.isRetweet(container)) {
            return;
          }

          // First check for actual photos/images
          if (this.config.detectImages) {
            const hasImage = container.querySelector(
              'div[data-testid="tweetPhoto"]:not([data-testid*="video"]), ' +
              'a[href*="/photo/"]:not([href*="video"]), ' +
              'div[data-testid="media-image"]:not([data-testid*="video"]), ' +
              'img[src*="twimg.com/media/"]:not([src*="video"]), ' +
              'div[class*="r-1mlwlqe"][class*="r-1udh08x"]:not([class*="video"])'
            );

            if (hasImage) {
              const newImages = this.extractImageData(container);
              if (newImages > 0) {
                this.log(`Found ${newImages} new images in container`, 'success');
                newImagesCount += newImages;
                // Force UI update
                this.updateUI();
              }
            }
          }

          // Then check for videos
          if (this.config.detectVideos) {
            const hasVideo = container.querySelector(
              'div[data-testid="videoPlayer"], ' +
              'div[data-testid="videoComponent"], ' +
              'div[data-testid="media-video-player"], ' +
              'video[src*="video.twimg.com"], ' +
              'div[data-testid="playButton"], ' +
              'div[class*="r-1niwhzg"][class*="r-vvn4in"], ' +
              'div[class*="r-1p0dtai"][class*="r-1d2f490"]'
            );

            if (hasVideo) {
              const newVideos = this.extractVideoData(container);
              if (newVideos > 0) {
                this.log(`Found ${newVideos} new videos in container`, 'success');
                newVideosCount += newVideos;
                // Force UI update
                this.updateUI();
              }
            }
          }
        } catch (containerError) {
          this.log(`Error processing tweet container: ${containerError.message}`, 'warning');
        }
      });

      this.state.newlyDiscoveredVideos += newVideosCount;
      this.state.newlyDiscoveredImages += newImagesCount;

      if (newVideosCount > 0 || newImagesCount > 0) {
        this.log(`Found ${newVideosCount} new videos and ${newImagesCount} new images`, 'success');
        // Ensure UI is updated
        this.displayResults();
      }

      return { newVideos: newVideosCount, newImages: newImagesCount };
    } catch (error) {
      this.log(`Error detecting media: ${error.message}`, 'error');
      return { newVideos: 0, newImages: 0 };
    }
  }
  
  /**
   * Find the parent tweet container for a given element
   * @param {Element} element - Element to find parent for
   * @param {Array} selectors - Array of possible parent selectors
   * @returns {Element|null} - Parent tweet container or null
   */
  findParentTweet(element, selectors) {
    if (!element || !(element instanceof Element)) {
      return null;
    }
    
    // Try closest first (more efficient)
    try {
      const selectorString = selectors.join(',');
      const closest = element.closest(selectorString);
      if (closest) return closest;
    } catch (error) {
      // If closest fails (e.g., in older browsers), try alternative
    }
    
    // If closest didn't work, try walking up the DOM
    let current = element;
    const maxDepth = 10; // Prevent infinite loops
    let depth = 0;
    
    while (current && current !== document.body && depth < maxDepth) {
      // Check if current element matches any selector
      for (const selector of selectors) {
        try {
          if (current.matches && current.matches(selector)) {
            return current;
          }
        } catch (error) {
          // Skip invalid selectors
        }
      }
      
      // Move up to parent
      current = current.parentElement;
      depth++;
    }
    
    return null;
  }
  
  /**
   * Check if an element is a reply tweet
   * @param {Element} element - Tweet element
   * @returns {boolean} - True if it's a reply
   */
  isReply(element) {
    if (!element || !(element instanceof Element)) {
      return false;
    }
    
    // Updated for 2025 Twitter/X
    const replySelectors = [
      '[data-testid="Tweet-User-Avatar:Reply"]',
      '.css-175oi2r.r-k4xj1c',
      'div[aria-label*="Reply"]',
      'div[data-testid="reply"]'
    ];
    
    for (const selector of replySelectors) {
      try {
        if (element.querySelector(selector)) {
          return true;
        }
      } catch (error) {
        // Skip invalid selectors
      }
    }
    
    return false;
  }
  
  /**
   * Check if an element is a retweet
   * @param {Element} element - Tweet element
   * @returns {boolean} - True if it's a retweet
   */
  isRetweet(element) {
    if (!element || !(element instanceof Element)) {
      return false;
    }
    
    // Updated for 2025 Twitter/X
    const retweetSelectors = [
      '[data-testid="socialContext"]',
      'span.css-1qaijid.r-bcqeeo.r-qvutc0.r-1tl8opc',
      'div[data-testid="retweetedBy"]'
    ];
    
    for (const selector of retweetSelectors) {
      try {
        if (element.querySelector(selector)) {
          return true;
        }
      } catch (error) {
        // Skip invalid selectors
      }
    }
    
    return false;
  }
  
  /**
   * Extract and cache video data from a tweet element
   * @param {Element} tweetElement - Tweet DOM element to process
   * @returns {number} - Number of new videos added to cache
   */
  extractVideoData(element) {
    if (!element || !(element instanceof Element)) {
      this.log('Invalid element passed to extractVideoData', 'warning');
      return 0;
    }

    try {
      // Get tweet metadata first
      const tweetMetadata = this.extractTweetMetadata(element);
      if (!tweetMetadata) {
        this.log('Could not extract tweet metadata for video', 'warning');
        return 0;
      }

      // Find video container - updated selectors for both main feed and media page
      const videoContainer = element.querySelector(
        'div[data-testid="videoPlayer"], ' +
        'div[data-testid="videoComponent"], ' +
        'div[data-testid="media-video-player"], ' +
        'div[class*="r-1niwhzg"][class*="r-vvn4in"], ' +
        'div[class*="r-1p0dtai"][class*="r-1d2f490"]'
      );

      if (!videoContainer) {
        return 0; // No video found
      }

      // Extract video details
      let videoSrc = null;
      let posterSrc = null;
      let duration = 0;

      // Try to find video element
      const videoElement = videoContainer.querySelector('video') || 
                          element.querySelector('video');

      if (videoElement) {
        // Try to get direct video source
        videoSrc = videoElement.src;
        posterSrc = videoElement.poster;
        duration = videoElement.duration || 0;

        // If no direct source, try to get from source elements
        if (!videoSrc) {
          const sources = videoElement.querySelectorAll('source');
          for (const source of sources) {
            if (source.src) {
              videoSrc = source.src;
              break;
            }
          }
        }

        // Try to get from data attributes if still no source
        if (!videoSrc) {
          videoSrc = videoElement.getAttribute('data-url') || 
                     videoElement.getAttribute('data-video-url') ||
                     videoElement.getAttribute('data-src');
        }
      }

      // If still no video source, try additional selectors
      if (!videoSrc) {
        // Check for media page video source
        const mediaPageVideo = element.querySelector('div[class*="r-1niwhzg"][class*="r-vvn4in"]');
        if (mediaPageVideo) {
          const bgImage = mediaPageVideo.style.backgroundImage;
          if (bgImage) {
            // Convert video thumbnail URL to video URL
            posterSrc = bgImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1');
            videoSrc = posterSrc.replace(/\/img\//, '/vid/')
                               .replace(/\?format=jpg.*$/, '?tag=1');
          }
        }

        // Check other video sources
        const videoSources = element.querySelectorAll('[data-video-url], [data-url], [data-src], [src*="video.twimg.com"]');
        for (const source of videoSources) {
          videoSrc = source.getAttribute('data-video-url') || 
                     source.getAttribute('data-url') ||
                     source.getAttribute('data-src') ||
                     source.getAttribute('src');
          if (videoSrc) break;
        }
      }

      // Try to get duration from time element if not found
      if (!duration) {
        const timeElement = element.querySelector('time[aria-label*="Duration"], span[data-testid="videoTimeLabel"]');
        if (timeElement) {
          const durationText = timeElement.textContent || timeElement.getAttribute('datetime');
          duration = this.convertDurationToSeconds(durationText);
        }
      }

      // Get tweet URL for full video URL
      const tweetUrl = this.findStatusUrl(element);
      const fullUrl = this.buildFullUrl(tweetUrl);

      // If no direct video URL, use tweet URL
      if (!videoSrc && fullUrl) {
        videoSrc = fullUrl;
      }

      // If no poster, try to find thumbnail
      if (!posterSrc) {
        const thumbnailInfo = this.extractThumbnail(element);
        posterSrc = thumbnailInfo.thumbnailUrl;
      }

      if (!videoSrc && !posterSrc) {
        this.log('No video source or poster found', 'warning');
        return 0;
      }

      // Generate unique ID for this video
      const videoId = this.generateUniqueId(tweetUrl || '', videoSrc || posterSrc);

      // Check if we've already processed this video
      if (this.state.videoCache.has(videoId) || 
          Array.from(this.state.videoCache.values()).some(v => v.url === videoSrc)) {
        return 0;
      }

      // Create video data object
      const videoData = {
        id: videoId,
        url: videoSrc,
        fullUrl: fullUrl,
        thumbnailUrl: posterSrc,
        downloadUrl: tweetUrl ? this.buildDownloadUrl(this.extractTweetId(tweetUrl)) : '',
        durationSeconds: duration,
        durationText: this.formatDuration(duration),
        ...tweetMetadata,
        timestamp: Date.now(),
        discoveredAtScroll: this.state.scrollCount
      };

      // Add to cache
      this.state.videoCache.set(videoId, videoData);
      
      // Update UI if needed
      if (this.config.updateUIOnNewContent) {
        this.updateUI();
      }

      return 1;
    } catch (error) {
      this.log(`Error extracting video data: ${error.message}`, 'error');
      return 0;
    }
  }
  
  /**
   * Extract and cache image data from a tweet element
   * @param {Element} element - Tweet DOM element to process
   * @returns {number} - Number of new images added to cache
   */
  extractImageData(element) {
    if (!element || !(element instanceof Element)) {
      this.log('Invalid element passed to extractImageData', 'warning');
      return 0;
    }

    try {
      // Get tweet metadata first
      const tweetMetadata = this.extractTweetMetadata(element);
      if (!tweetMetadata) {
        this.log('Could not extract tweet metadata for image', 'warning');
        return 0;
      }

      // Get tweet URL
      const tweetUrl = this.findStatusUrl(element);
      if (!tweetUrl) {
        this.log('Could not find tweet URL', 'warning');
      }
      const fullUrl = this.buildFullUrl(tweetUrl);

      // Find all image containers
      const imageContainers = element.querySelectorAll(
        'div[data-testid="tweetPhoto"]:not([data-testid*="video"]), ' +
        'a[href*="/photo/"]:not([href*="video"]), ' +
        'div[data-testid="media-image"]:not([data-testid*="video"]), ' +
        'img[src*="twimg.com/media/"]:not([src*="video"]), ' +
        'div[class*="r-1mlwlqe"][class*="r-1udh08x"]:not([class*="video"])'
      );

      this.log(`Found ${imageContainers.length} potential image containers`, 'info');

      if (!imageContainers || imageContainers.length === 0) {
        return 0;
      }

      let newImages = 0;

      // Process each image container
      Array.from(imageContainers).forEach((container, index) => {
        try {
          if (!container || !(container instanceof Element)) {
            this.log(`Invalid container at index ${index}`, 'warning');
            return;
          }

          // Find image element
          let imgElement = container.querySelector('img');
          let imageSrc = '';

          if (imgElement && imgElement instanceof HTMLImageElement) {
            imageSrc = imgElement.src;
            this.log(`Found direct image source: ${imageSrc}`, 'info');
          }

          // Check for background image
          if (!imageSrc) {
            const bgContainer = container.querySelector('div[class*="r-1niwhzg"]') || container;
            const bgImage = window.getComputedStyle(bgContainer).backgroundImage;
            if (bgImage && bgImage !== 'none') {
              imageSrc = bgImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1');
              this.log(`Found background image source: ${imageSrc}`, 'info');
            }
          }

          // Skip if no valid image source or if it's a video-related image
          if (!imageSrc || 
              !imageSrc.includes('twimg.com') || 
              imageSrc.includes('video') || 
              imageSrc.includes('_normal.jpg') || 
              imageSrc.includes('_bigger.jpg') || 
              imageSrc.includes('video_thumb') || 
              imageSrc.includes('amplify_video_thumb') ||
              imageSrc.includes('semantic_core_img') ||
              imageSrc.includes('community_banner_img') ||
              imageSrc.includes('profile_images')) {
            this.log('Skipping invalid image or video-related content', 'info');
            return;
          }

          // Get highest quality version
          if (imageSrc.includes('pbs.twimg.com/media/')) {
            const originalSrc = imageSrc;
            imageSrc = imageSrc.split('?')[0] + '?format=jpg&name=4096x4096';
            this.log(`Upgraded image quality from ${originalSrc} to ${imageSrc}`, 'info');
          }

          // Generate unique ID
          const imageId = this.generateUniqueId(tweetUrl || '', imageSrc);

          // Check for duplicates
          if (this.state.imageCache.has(imageId) || 
              Array.from(this.state.imageCache.values()).some(i => i.url === imageSrc)) {
            this.log(`Skipping duplicate image: ${imageId}`, 'info');
            return;
          }

          // Get dimensions
          let width = 0;
          let height = 0;
          if (imgElement) {
            width = imgElement.naturalWidth || imgElement.width || 0;
            height = imgElement.naturalHeight || imgElement.height || 0;
            this.log(`Image dimensions: ${width}x${height}`, 'info');
          }

          // Create image data object
          const imageData = {
            id: imageId,
            url: imageSrc,
            fullUrl: fullUrl,
            downloadUrl: imageSrc,
            previewUrl: imageSrc.replace('4096x4096', '360x360'),
            width: width,
            height: height,
            ...tweetMetadata,
            timestamp: Date.now(),
            discoveredAtScroll: this.state.scrollCount
          };

          // Add to image cache (not video cache)
          this.state.imageCache.set(imageId, imageData);
          newImages++;

          this.log(`Successfully added new image: ${imageId}`, 'success');
        } catch (containerError) {
          this.log(`Error processing image container: ${containerError.message}`, 'warning');
        }
      });

      // Update UI if needed
      if (newImages > 0) {
        this.log(`Added ${newImages} new images to cache`, 'success');
        if (this.config.updateUIOnNewContent) {
          this.updateUI();
          this.displayResults();
        }
      }

      return newImages;
    } catch (error) {
      this.log(`Error extracting image data: ${error.message}`, 'error');
      console.error('Image extraction error:', error);
      return 0;
    }
  }
  
  /**
   * Build a full URL from a status link
   * @param {string} statusLink - Status link path
   * @returns {string} - Full URL
   */
  buildFullUrl(statusLink) {
    if (!statusLink) return '';
    
    // Handle already full URLs
    if (statusLink.startsWith('http')) {
      return statusLink;
    }
    
    // Handle protocol-relative URLs
    if (statusLink.startsWith('//')) {
      return `https:${statusLink}`;
    }
    
    // Handle relative URLs
    return `https://twitter.com${statusLink.startsWith('/') ? '' : '/'}${statusLink}`;
  }
  
  /**
   * Build a download URL for a tweet ID
   * @param {string} tweetId - Tweet ID
   * @returns {string} - Download URL
   */
  buildDownloadUrl(tweetId) {
    if (!tweetId) return '';
    
    // Use multiple download services for redundancy
    const downloadServices = [
      `https://x-downloader.com/i/status/${tweetId}`,
      `https://twittervideodownloader.com/download?url=https://twitter.com/i/status/${tweetId}`,
      `https://twsaver.com/twitter-downloader/?url=https://twitter.com/i/status/${tweetId}`
    ];
    
    // Return the primary service
    return downloadServices[0];
  }
  
  /**
   * Extract tweet metadata from an element
   * @param {Element} element - Tweet element
   * @returns {Object} Metadata object
   */
  extractTweetMetadata(element) {
    const metadata = {
      username: '',
      displayName: '',
      tweetText: '',
      dateTime: '',
      engagement: {
        likes: 0,
        retweets: 0,
        replies: 0,
        views: 0
      }
    };

    try {
      // Find the tweet container if we're not already at it
      const tweetContainer = element.closest('article[data-testid="tweet"], div[data-testid="tweet"], article[role="article"]') || element;

      // Extract username and display name - updated selectors
      const userInfo = tweetContainer.querySelector('div[data-testid="User-Name"]');
      if (userInfo) {
        const usernameElement = userInfo.querySelector('a[role="link"] span');
        const displayNameElement = userInfo.querySelector('span span');
        
        if (usernameElement) {
          metadata.username = usernameElement.textContent.trim().replace('@', '');
        }
        if (displayNameElement) {
          metadata.displayName = displayNameElement.textContent.trim();
        }
      }

      // Extract tweet text
      const textElement = tweetContainer.querySelector('div[data-testid="tweetText"]');
      if (textElement) {
        metadata.tweetText = textElement.textContent.trim();
      }

      // Extract date and time with proper formatting
      const timeElement = tweetContainer.querySelector('time');
      if (timeElement) {
        const datetime = timeElement.getAttribute('datetime');
        if (datetime) {
          metadata.dateTime = datetime;
          const date = new Date(datetime);
          if (!isNaN(date.getTime())) {
            // Format the display time
            const now = new Date();
            const isCurrentYear = date.getFullYear() === now.getFullYear();
            const options = isCurrentYear ? 
              { month: 'short', day: 'numeric' } : 
              { month: 'short', day: 'numeric', year: 'numeric' };
            metadata.displayTime = date.toLocaleDateString('en-US', options);
          }
        }
      }

      // Extract engagement metrics with improved selectors
      const engagementMetrics = {
        likes: tweetContainer.querySelector('div[data-testid="like"] span[data-testid="app-text-transition-container"]'),
        retweets: tweetContainer.querySelector('div[data-testid="retweet"] span[data-testid="app-text-transition-container"]'),
        replies: tweetContainer.querySelector('div[data-testid="reply"] span[data-testid="app-text-transition-container"]'),
        views: tweetContainer.querySelector('a[href*="/analytics"] span, span[data-testid="analytics"] span')
      };

      // Process each metric
      Object.entries(engagementMetrics).forEach(([type, element]) => {
        if (element && element.textContent) {
          const value = this.parseEngagementCount(element.textContent.trim());
          if (!isNaN(value)) {
            metadata.engagement[type] = value;
          }
        }
      });

      // Additional check for view count in different format
      if (metadata.engagement.views === 0) {
        const viewElement = tweetContainer.querySelector('span[data-testid="analytics"]');
        if (viewElement) {
          const viewText = viewElement.textContent.trim();
          metadata.engagement.views = this.parseEngagementCount(viewText);
        }
      }

    } catch (e) {
      this.log(`Error extracting metadata: ${e.message}`, 'warning');
    }

    return metadata;
  }

  /**
   * Parse engagement count from text (e.g., "1.5K" -> 1500)
   * @param {string} text - Engagement count text
   * @returns {number} Parsed count
   */
  parseEngagementCount(text) {
    if (!text) return 0;
    
    try {
      // Remove non-numeric characters except K, M, B and decimal points
      const cleanText = text.replace(/[^0-9KkMmBb.]/g, '').toUpperCase();
      
      if (cleanText.length === 0) return 0;
      
      // Parse based on suffixes
      const number = parseFloat(cleanText.replace(/[KMB]/g, ''));
      
      if (isNaN(number)) return 0;
      
      if (cleanText.includes('K')) {
        return Math.round(number * 1000);
      } else if (cleanText.includes('M')) {
        return Math.round(number * 1000000);
      } else if (cleanText.includes('B')) {
        return Math.round(number * 1000000000);
      } else {
        return Math.round(number);
      }
    } catch (e) {
      this.log(`Error parsing engagement count: ${text}`, 'warning');
      return 0;
    }
  }
  
  /**
   * Extract thumbnail information from a tweet element
   * @param {Element} element - Tweet element
   * @returns {Object} Thumbnail info object
   */
  extractThumbnail(element) {
    const thumbnailInfo = {
      thumbnailUrl: '',
      thumbnailWidth: 0,
      thumbnailHeight: 0
    };
    
    try {
      // Find the best quality image (updated for 2025 Twitter/X)
      const imgElements = Array.from(element.querySelectorAll('img'))
        .filter(img => {
          const isAvatar = img.closest('[data-testid="User-Avatar"]') !== null;
          const isEmoji = img.classList.contains('emoji') || img.src.includes('emoji');
          const isIcon = img.width < 20 || img.height < 20;
          
          return !isAvatar && !isEmoji && !isIcon;
        });
      
      if (imgElements.length > 0) {
        // Sort by size (width*height) descending for highest quality
        imgElements.sort((a, b) => {
          const aSize = (a.naturalWidth || a.width || 0) * (a.naturalHeight || a.height || 0);
          const bSize = (b.naturalWidth || b.width || 0) * (b.naturalHeight || b.height || 0);
          return bSize - aSize;
        });
        
        const bestImg = imgElements[0];
        
        // Clean up thumbnail URL for best quality
        let thumbnailUrl = bestImg.src;
        
        // Fix Twitter's image URL formats for highest quality
        if (thumbnailUrl.includes('pbs.twimg.com/media/')) {
          // Remove query parameters and size restrictions
          thumbnailUrl = thumbnailUrl.split('?')[0];
          
          // Add quality format for best resolution
          if (!thumbnailUrl.endsWith('.jpg') && !thumbnailUrl.endsWith('.png')) {
            thumbnailUrl += '?format=jpg&name=large';
          }
        }
        
        thumbnailInfo.thumbnailUrl = thumbnailUrl;
        
        // Try to get width and height
        thumbnailInfo.thumbnailWidth = bestImg.naturalWidth || bestImg.width || 0;
        thumbnailInfo.thumbnailHeight = bestImg.naturalHeight || bestImg.height || 0;
      }
    } catch (e) {
      this.log(`Error extracting thumbnail: ${e.message}`, 'warning');
    }
    
    return thumbnailInfo;
  }
  
  /**
   * Find the status URL in a tweet element
   * @param {Element} tweetElement - Tweet element
   * @returns {string|null} Status URL or null if not found
   */
  findStatusUrl(tweetElement) {
    if (!tweetElement || !(tweetElement instanceof Element)) {
      this.log('Invalid element passed to findStatusUrl', 'warning');
      return null;
    }

    try {
      // Try several strategies to find the tweet URL (updated for 2025 Twitter/X)
      const linkSelectors = [
        'a[href*="/status/"]',
        '[data-testid="tweet"] a[role="link"]',
        'time[datetime]',
        'a[role="link"][href*="/status/"]',
        'div[data-testid="User-Name"] + div a[role="link"]'
      ];
      
      for (const selector of linkSelectors) {
        try {
          const links = tweetElement.querySelectorAll(selector);
          
          for (const link of links) {
            const href = link.getAttribute('href');
            if (href && href.includes('/status/')) {
              return href;
            }
          }
        } catch (error) {
          // Skip selectors that cause errors
          continue;
        }
      }
      
      // Try to find a parent element with tweet ID attribute
      const tweetIdAttrs = ['data-tweet-id', 'data-item-id', 'data-status-id'];
      
      for (const attr of tweetIdAttrs) {
        const element = tweetElement.querySelector(`[${attr}]`);
        if (element) {
          const tweetId = element.getAttribute(attr);
          if (tweetId) {
            return `/status/${tweetId}`;
          }
        }
      }
    } catch (error) {
      this.log(`Error finding status URL: ${error.message}`, 'warning');
    }
    
    return null;
  }
  
  /**
   * Extract tweet ID from a status URL
   * @param {string} url - Status URL
   * @returns {string|null} Tweet ID or null if not found
   */
  extractTweetId(url) {
    if (!url) return null;
    
    // Pattern matching for different URL formats
    const patterns = [
      /\/status\/(\d+)/,        // Standard /status/123456
      /statuses\/(\d+)/,        // API style /statuses/123456
      /status\/(\d+)\/photo/,   // Photo URLs
      /i\/status\/(\d+)/        // Shortened i/status format
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  }
  
  /**
   * Convert duration string to seconds
   * @param {string} durationText - Duration string (e.g., "1:30")
   * @returns {number} - Duration in seconds
   */
  convertDurationToSeconds(durationText) {
    if (!durationText) return 0;
    
    try {
      // Normalize the text (remove non-numeric and non-colon characters)
      const normalizedText = durationText.replace(/[^\d:\.]/g, '');
      
      // Split into components
      const parts = normalizedText.split(':').map(part => parseFloat(part));
      
      if (parts.length === 3) {
        // Format: hours:minutes:seconds
        return Math.round((parts[0] * 3600) + (parts[1] * 60) + parts[2]);
      } else if (parts.length === 2) {
        // Format: minutes:seconds
        return Math.round((parts[0] * 60) + parts[1]);
      } else if (parts.length === 1 && !isNaN(parts[0])) {
        // Format: seconds only
        return Math.round(parts[0]);
      }
    } catch (e) {
      this.log(`Error parsing duration: ${durationText}`, 'error');
    }
    
    return 0;
  }
  
  /**
   * Format duration in seconds to human-readable string
   * @param {number} seconds - Duration in seconds
   * @returns {string} - Formatted duration
   */
  formatDuration(seconds) {
    if (!seconds) return '0s';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    let result = '';
    
    if (hours > 0) {
      result += `${hours}h `;
    }
    
    if (minutes > 0 || hours > 0) {
      result += `${minutes}m `;
    }
    
    result += `${secs}s`;
    
    return result.trim();
  }
  
  /**
   * Create the user interface
   */
  createInterface() {
    // Clean up existing UI
    if (this.ui.overlay && this.ui.overlay.parentNode) {
      this.ui.overlay.parentNode.removeChild(this.ui.overlay);
    }
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'twitter-media-analyzer';
    overlay.className = 'twitter-media-analyzer';
    
    if (this.state.isMinimized) {
      // Minimized state
      this.createMinimizedInterface(overlay, this.colors);
    } else {
      // Full interface
      this.createFullInterface(overlay, this.colors);
    }
    
    // Add to DOM
    document.body.appendChild(overlay);
    
    // Store UI reference
    this.ui.overlay = overlay;
  }
  
  /**
   * Create minimized floating interface
   * @param {Element} container - Container element
   * @param {Object} colors - Color scheme
   */
  createMinimizedInterface(container, colors) {
    // Position based on config
    const position = this.config.minimizedPosition || 'bottom-right';
    
    // Set styles based on position
    let positionStyles = '';
    if (position === 'bottom-right') {
      positionStyles = 'bottom: 20px; right: 20px;';
    } else if (position === 'bottom-left') {
      positionStyles = 'bottom: 20px; left: 20px;';
    } else if (position === 'top-right') {
      positionStyles = 'top: 20px; right: 20px;';
    } else if (position === 'top-left') {
      positionStyles = 'top: 20px; left: 20px;';
    }
    
    container.style.cssText = `
      position: fixed;
      ${positionStyles}
      z-index: 10000;
      display: flex;
      flex-direction: column;
      align-items: center;
    `;
    
    // Create minimized button
    const button = document.createElement('button');
    button.style.cssText = `
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: ${colors.primary};
      color: white;
      font-size: 20px;
      border: none;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    `;
    button.innerHTML = '🎬';
    button.title = 'Twitter Media Analyzer';
    
    button.onmouseover = () => {
      button.style.transform = 'scale(1.1)';
    };
    
    button.onmouseout = () => {
      button.style.transform = 'scale(1)';
    };
    
    button.onclick = this.toggleMinimize;
    
    // Status badge showing counts
    const totalVideos = this.state.videoCache.size;
    const totalImages = this.state.imageCache.size;
    
    if (totalVideos > 0 || totalImages > 0) {
      const badge = document.createElement('div');
      badge.style.cssText = `
        background-color: ${colors.error};
        color: white;
        border-radius: 12px;
        padding: 3px 8px;
        font-size: 12px;
        font-weight: bold;
        position: absolute;
        top: -5px;
        right: -5px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      `;
      badge.textContent = `${totalVideos + totalImages}`;
      button.appendChild(badge);
    }
    
    container.appendChild(button);
  }
  
  /**
   * Create full interface
   * @param {Element} container - Container element
   * @param {Object} colors - Color scheme
   */
  createFullInterface(container, colors) {
    // Main container styling - adjust based on fullscreen state
    if (this.state.isFullscreen) {
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100vh;
        background: ${colors.background};
        color: ${colors.text};
        display: flex;
        flex-direction: column;
        z-index: 9999;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      `;
    } else {
      container.style.cssText = `
        position: fixed;
        top: 0;
        right: 0;
        width: 350px;
        height: 100vh;
        background: ${colors.background};
        color: ${colors.text};
        display: flex;
        flex-direction: column;
        z-index: 9999;
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      `;
    }

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 12px;
      border-bottom: 1px solid ${colors.border};
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: ${colors.card};
    `;

    const title = document.createElement('div');
    title.textContent = 'Media Analyzer';
    title.style.cssText = `
      font-weight: 600;
      font-size: 16px;
      color: ${colors.text};
    `;

    const controls = document.createElement('div');
    controls.style.cssText = `
      display: flex;
      gap: 8px;
    `;

    // Minimize button
    const minimizeButton = document.createElement('button');
    minimizeButton.innerHTML = '−';
    minimizeButton.style.cssText = `
      background: none;
      border: none;
      color: ${colors.text};
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 16px;
    `;
    minimizeButton.onclick = this.toggleMinimize;
    minimizeButton.title = "Minimize";

    // Fullscreen toggle button
    const fullscreenButton = document.createElement('button');
    fullscreenButton.innerHTML = this.state.isFullscreen ? '⊡' : '⊞';
    fullscreenButton.style.cssText = `
      background: none;
      border: none;
      color: ${colors.text};
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 16px;
    `;
    fullscreenButton.onclick = this.toggleFullscreen;
    fullscreenButton.title = this.state.isFullscreen ? "Exit Fullscreen" : "Fullscreen";

    // Start/Stop button
    const actionButton = document.createElement('button');
    actionButton.textContent = this.isAnalyzing ? 'Stop' : 'Start';
    actionButton.style.cssText = `
      background: ${this.isAnalyzing ? colors.error : colors.primary};
      color: white;
      border: none;
      border-radius: 4px;
      padding: 4px 12px;
      font-size: 14px;
      cursor: pointer;
    `;
    actionButton.onclick = () => {
      if (this.isAnalyzing) {
        this.stop();
      } else {
        this.start();
      }
      actionButton.textContent = this.isAnalyzing ? 'Stop' : 'Start';
      actionButton.style.background = this.isAnalyzing ? colors.error : colors.primary;
    };

    // Add controls
    controls.appendChild(actionButton);
    controls.appendChild(fullscreenButton);
    controls.appendChild(minimizeButton);
    header.appendChild(title);
    header.appendChild(controls);
    
    // Tabs container
    const tabsContainer = document.createElement('div');
    tabsContainer.style.cssText = `
      display: flex;
      padding: 0 12px;
      background: ${colors.card};
      border-bottom: 1px solid ${colors.border};
    `;

    const createTab = (id, label) => {
      const tab = document.createElement('button');
      tab.id = `tab-${id}`;
      tab.className = 'tab';
      tab.setAttribute('data-tab', id);
      tab.textContent = label;
      tab.style.cssText = `
        padding: 12px 16px;
        background: none;
        border: none;
        color: ${this.state.currentTab === id ? colors.primary : colors.text};
        cursor: pointer;
        position: relative;
        font-size: 14px;
        border-bottom: ${this.state.currentTab === id ? `2px solid ${colors.primary}` : 'none'};
        margin-bottom: ${this.state.currentTab === id ? '-2px' : '0'};
        font-weight: ${this.state.currentTab === id ? '600' : '400'};
      `;
      tab.onclick = () => this.switchTab(id);
      return tab;
    };

    const videosTab = createTab('videos', 'Videos');
    const imagesTab = createTab('images', 'Images');
    const statsTab = createTab('stats', 'Statistics');

    // Content container
    const content = document.createElement('div');
    content.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    `;

    // Tab content containers
    const videosContent = document.createElement('div');
    videosContent.id = 'tab-content-videos';
    videosContent.className = 'tab-content';
    videosContent.setAttribute('data-tab', 'videos');
    videosContent.style.display = this.state.currentTab === 'videos' ? 'block' : 'none';

    const imagesContent = document.createElement('div');
    imagesContent.id = 'tab-content-images';
    imagesContent.className = 'tab-content';
    imagesContent.setAttribute('data-tab', 'images');
    imagesContent.style.display = this.state.currentTab === 'images' ? 'block' : 'none';

    const statsContent = document.createElement('div');
    statsContent.id = 'tab-content-stats';
    statsContent.className = 'tab-content';
    statsContent.setAttribute('data-tab', 'stats');
    statsContent.style.display = this.state.currentTab === 'stats' ? 'block' : 'none';

    // Filter section
    const filterSection = document.createElement('div');
    filterSection.style.cssText = `
      padding: 12px;
      border-bottom: 1px solid ${colors.border};
      background: ${colors.card};
    `;

    // Status section for messages
    const statusSection = document.createElement('div');
    statusSection.className = 'twitter-media-analyzer-status';
    statusSection.style.cssText = `
      padding: 8px 12px;
      margin: 0;
      font-size: 14px;
      background: ${colors.card};
      color: ${colors.text};
      border-bottom: 1px solid ${colors.border};
    `;
    statusSection.textContent = 'Ready to analyze Twitter media';

    // Assemble the interface
    tabsContainer.appendChild(videosTab);
    tabsContainer.appendChild(imagesTab);
    tabsContainer.appendChild(statsTab);

    content.appendChild(videosContent);
    content.appendChild(imagesContent);
    content.appendChild(statsContent);

    container.appendChild(header);
    container.appendChild(statusSection);
    container.appendChild(tabsContainer);
    container.appendChild(filterSection);
    container.appendChild(content);

    // Create filter component
    this.createFilterComponent(filterSection, colors);

    // Initialize content for each tab
    this.displayResults();

    // Add accessibility attributes
    this.initializeAccessibility();
  }
  
  /**
   * Render an image card
   * @param {Object} image - Image data
   * @returns {Element} - Image card element
   */
  renderImageCard(image) {
    const colors = this.colors;
    
    const card = document.createElement('div');
    card.className = 'image-card';
    card.setAttribute('data-id', image.id);
    card.style.cssText = `
      background: ${colors.card};
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid ${colors.border};
      transition: transform 0.2s, box-shadow 0.2s;
    `;
    
    // Same structure as video card, but for images
    // Add hover effect
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-2px)';
      card.style.boxShadow = `0 4px 8px rgba(0, 0, 0, 0.1)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = 'none';
    });
    
    // Image preview
    const imagePreview = document.createElement('div');
    imagePreview.style.cssText = `
      width: 100%;
      aspect-ratio: 4 / 3;
      background: #000;
      position: relative;
      overflow: hidden;
      background-image: url(${image.previewUrl || image.url});
      background-size: cover;
      background-position: center;
      cursor: pointer;
    `;
    
    // Preview click
    imagePreview.addEventListener('click', () => {
      window.open(image.url, '_blank');
    });
    
    // Content
    const content = document.createElement('div');
    content.style.cssText = `
      padding: 12px;
    `;
    
    // Username and date
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    `;
    
    const username = document.createElement('div');
    username.style.cssText = `
      font-weight: 600;
      color: ${colors.text};
    `;
    username.textContent = image.username || 'Unknown';
    
    const date = document.createElement('div');
    date.style.cssText = `
      font-size: 12px;
      color: ${colors.secondary};
    `;
    date.textContent = image.dateTime || '';
    
    header.appendChild(username);
    header.appendChild(date);
    
    // Tweet text
    const tweetText = document.createElement('div');
    tweetText.style.cssText = `
      margin-bottom: 8px;
      color: ${colors.text};
      font-size: 14px;
      line-height: 1.4;
      max-height: 60px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    `;
    tweetText.textContent = image.tweetText || '';
    
    // Download button
    const downloadBtn = document.createElement('button');
    downloadBtn.style.cssText = `
      margin-top: 12px;
      width: 100%;
      padding: 8px;
      background: ${colors.primary};
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    `;
    downloadBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
      </svg>
      Download
    `;
    
    downloadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const a = document.createElement('a');
      a.href = image.downloadUrl || image.url;
      a.download = `twitter-image-${image.id}`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });

    // Go to Tweet button
    const tweetBtn = document.createElement('button');
    tweetBtn.style.cssText = `
      margin-top: 8px;
      width: 100%;
      padding: 8px;
      background: ${colors.background};
      color: ${colors.text};
      border: 1px solid ${colors.border};
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    `;
    tweetBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
      </svg>
      Go to Tweet
    `;
    
    tweetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (image.fullUrl) {
        window.open(image.fullUrl, '_blank');
      }
    });
    
    // Assemble card
    content.appendChild(header);
    content.appendChild(tweetText);
    content.appendChild(downloadBtn);
    content.appendChild(tweetBtn);
    
    card.appendChild(imagePreview);
    card.appendChild(content);
    
    return card;
  }
  
  /**
   * Render a video card
   * @param {Object} video - Video data
   * @returns {Element} - Video card element
   */
  renderVideoCard(video) {
    const colors = this.colors;
    
    const card = document.createElement('div');
    card.className = 'video-card';
    card.setAttribute('data-id', video.id);
    card.style.cssText = `
      background: ${colors.card};
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid ${colors.border};
      transition: transform 0.2s, box-shadow 0.2s;
    `;
    
    // Add hover effect
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-2px)';
      card.style.boxShadow = `0 4px 8px rgba(0, 0, 0, 0.1)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = 'none';
    });
    
    // Video preview
    const videoPreview = document.createElement('div');
    videoPreview.style.cssText = `
      width: 100%;
      aspect-ratio: 16 / 9;
      background: #000;
      position: relative;
      overflow: hidden;
      background-image: url(${video.thumbnailUrl || ''});
      background-size: cover;
      background-position: center;
      cursor: pointer;
    `;
    
    // Duration badge
    if (video.durationText) {
      const duration = document.createElement('div');
      duration.style.cssText = `
        position: absolute;
        bottom: 8px;
        right: 8px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
      `;
      duration.textContent = video.durationText;
      videoPreview.appendChild(duration);
    }
    
    // Play icon overlay
    const playIcon = document.createElement('div');
    playIcon.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    playIcon.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M8 5v14l11-7z"/>
      </svg>
    `;
    videoPreview.appendChild(playIcon);
    
    // Preview click
    videoPreview.addEventListener('click', () => {
      window.open(video.url, '_blank');
    });
    
    // Content
    const content = document.createElement('div');
    content.style.cssText = `
      padding: 12px;
    `;
    
    // Username and date
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    `;
    
    const username = document.createElement('div');
    username.style.cssText = `
      font-weight: 600;
      color: ${colors.text};
    `;
    username.textContent = video.username || 'Unknown';
    
    const date = document.createElement('div');
    date.style.cssText = `
      font-size: 12px;
      color: ${colors.secondary};
    `;
    date.textContent = video.dateTime || '';
    
    header.appendChild(username);
    header.appendChild(date);
    
    // Tweet text
    const tweetText = document.createElement('div');
    tweetText.style.cssText = `
      margin-bottom: 8px;
      color: ${colors.text};
      font-size: 14px;
      line-height: 1.4;
      max-height: 60px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    `;
    tweetText.textContent = video.tweetText || '';
    
    // Download button
    const downloadBtn = document.createElement('button');
    downloadBtn.style.cssText = `
      margin-top: 12px;
      width: 100%;
      padding: 8px;
      background: ${colors.primary};
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    `;
    downloadBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
      </svg>
      Download
    `;
    
    downloadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const a = document.createElement('a');
      a.href = video.downloadUrl || video.url;
      a.download = `twitter-video-${video.id}`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });

    // Go to Tweet button
    const tweetBtn = document.createElement('button');
    tweetBtn.style.cssText = `
      margin-top: 8px;
      width: 100%;
      padding: 8px;
      background: ${colors.background};
      color: ${colors.text};
      border: 1px solid ${colors.border};
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    `;
    tweetBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
      </svg>
      Go to Tweet
    `;
    
    tweetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (video.fullUrl) {
        window.open(video.fullUrl, '_blank');
      }
    });
    
    // Assemble card
    content.appendChild(header);
    content.appendChild(tweetText);
    content.appendChild(downloadBtn);
    content.appendChild(tweetBtn);
    
    card.appendChild(videoPreview);
    card.appendChild(content);
    
    return card;
  }
  
  /**
   * Getter for filtered and sorted videos
   */
  get videos() {
    const videos = Array.from(this.state.videoCache.values());
    const query = this.state.searchQuery.toLowerCase();
    
    // Filter by search query and remove 0-second videos
    const filtered = videos.filter(video => {
      // Filter out videos with zero duration
      if (video.durationSeconds === 0) {
        return false;
      }
      
      // Apply search filter if query exists
      if (query) {
        return (video.tweetText && video.tweetText.toLowerCase().includes(query)) ||
               (video.username && video.username.toLowerCase().includes(query)) ||
               (video.displayName && video.displayName.toLowerCase().includes(query));
      }
      
      return true;
    });
    
    // Sort by selected order
    return this.sortItems(filtered);
  }
  
  /**
   * Getter for filtered and sorted images
   */
  get images() {
    const images = Array.from(this.state.imageCache.values());
    const query = this.state.searchQuery.toLowerCase();
    
    // Filter by search query
    const filtered = query 
      ? images.filter(i => 
          (i.tweetText && i.tweetText.toLowerCase().includes(query)) ||
          (i.username && i.username.toLowerCase().includes(query)) ||
          (i.displayName && i.displayName.toLowerCase().includes(query))
        )
      : images;
    
    // Sort by selected order
    return this.sortItems(filtered);
  }
  
  /**
   * Sort items by the current sort order
   * @param {Array} items - Items to sort
   * @returns {Array} - Sorted items
   */
  sortItems(items) {
    switch (this.state.sortOrder) {
      case 'newest':
        return items.sort((a, b) => b.timestamp - a.timestamp);
      case 'oldest':
        return items.sort((a, b) => a.timestamp - b.timestamp);
      case 'likes':
        return items.sort((a, b) => 
          (b.engagement?.likes || 0) - (a.engagement?.likes || 0)
        );
      case 'retweets':
        return items.sort((a, b) => 
          (b.engagement?.retweets || 0) - (a.engagement?.retweets || 0)
        );
      case 'views':
        return items.sort((a, b) => 
          (b.engagement?.views || 0) - (a.engagement?.views || 0)
        );
      case 'duration':
        return items.sort((a, b) => 
          (b.durationSeconds || 0) - (a.durationSeconds || 0)
        );
      default:
        return items;
    }
  }

  /**
   * Toggle fullscreen mode
   */
  toggleFullscreen() {
    this.state.isFullscreen = !this.state.isFullscreen;
    this.createInterface();
  }

  /**
   * Export all media data as JSON
   */
  exportDataAsJson() {
    try {
      // Combine videos and images
      const videos = Array.from(this.state.videoCache.values());
      const images = Array.from(this.state.imageCache.values());
      
      // Create export object
      const exportData = {
        videos,
        images,
        stats: {
          totalVideos: videos.length,
          totalImages: images.length,
          totalMedia: videos.length + images.length,
          exportDate: new Date().toISOString(),
          scrollCount: this.state.scrollCount,
          newlyDiscoveredVideos: this.state.newlyDiscoveredVideos,
          newlyDiscoveredImages: this.state.newlyDiscoveredImages
        }
      };
      
      // Convert to JSON string
      const jsonContent = JSON.stringify(exportData, null, 2);
      
      // Create a download link
      this.downloadFile(jsonContent, 'twitter-media-export.json', 'application/json');
      
      this.log(`Exported ${videos.length + images.length} media items as JSON`, 'success');
    } catch (error) {
      this.log(`Error exporting JSON: ${error.message}`, 'error');
    }
  }
  
  /**
   * Download file helper method
   * @param {string} content - Content to download
   * @param {string} fileName - File name
   * @param {string} contentType - MIME type
   */
  downloadFile(content, fileName, contentType) {
    try {
      // Create a blob with the data
      const blob = new Blob([content], { type: contentType });
      
      // Create an object URL
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link for download
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none';
      
      // Add to DOM, click, then remove
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Release the object URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      this.log(`Error in downloadFile: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Export all media data as CSV
   */
  exportDataAsCsv() {
    try {
      const videos = Array.from(this.state.videoCache.values());
      const images = Array.from(this.state.imageCache.values());
      
      // Create CSV header
      let csvContent = 'Type,ID,Username,DisplayName,TweetText,URL,ThumbnailURL,FullURL,DateTime,Likes,Retweets,Replies,Views\n';
      
      // Process videos
      videos.forEach(video => {
        csvContent += [
          'Video',
          video.id || '',
          video.username || '',
          video.displayName || '',
          `"${(video.tweetText || '').replace(/"/g, '""')}"`, // Escape quotes
          video.url || '',
          video.thumbnailUrl || '',
          video.fullUrl || '',
          video.dateTime || '',
          video.engagement?.likes || 0,
          video.engagement?.retweets || 0,
          video.engagement?.replies || 0,
          video.engagement?.views || 0
        ].join(',') + '\n';
      });
      
      // Process images
      images.forEach(image => {
        csvContent += [
          'Image',
          image.id || '',
          image.username || '',
          image.displayName || '',
          `"${(image.tweetText || '').replace(/"/g, '""')}"`, // Escape quotes
          image.url || '',
          image.previewUrl || '',
          image.fullUrl || '',
          image.dateTime || '',
          image.engagement?.likes || 0,
          image.engagement?.retweets || 0,
          image.engagement?.replies || 0,
          image.engagement?.views || 0
        ].join(',') + '\n';
      });
      
      // Download the CSV file
      this.downloadFile(csvContent, 'twitter-media-export.csv', 'text/csv');
      
      this.log(`Exported ${videos.length + images.length} media items as CSV`, 'success');
    } catch (error) {
      this.log(`Error exporting CSV: ${error.message}`, 'error');
    }
  }
  
  /**
   * Import JSON data into the analyzer
   * @param {File|string} jsonInput - JSON file or string to import
   * @param {boolean} replace - Whether to replace existing data or merge
   * @returns {Promise<Object>} - Result summary
   */
  async importJsonData(jsonInput, replace = false) {
    try {
      let jsonContent;
      
      // Handle input type - either file or string
      if (typeof jsonInput === 'string') {
        // Direct JSON string
        jsonContent = jsonInput;
      } else if (jsonInput instanceof File) {
        // File object
        jsonContent = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (e) => reject(new Error("Failed to read file"));
          reader.readAsText(jsonInput);
        });
      } else {
        throw new Error("Invalid input type. Expected File or string.");
      }
      
      // Parse JSON
      const importData = JSON.parse(jsonContent);
      
      // Validate data structure
      if (!importData.videos || !importData.images) {
        throw new Error("Invalid JSON format. Missing videos or images data.");
      }
      
      // Track stats for result
      const result = {
        videosAdded: 0,
        imagesAdded: 0,
        videosSkipped: 0,
        imagesSkipped: 0,
        totalProcessed: importData.videos.length + importData.images.length
      };
      
      // Clear existing cache if replace is true
      if (replace) {
        this.state.videoCache.clear();
        this.state.imageCache.clear();
        this.log('Cleared existing cache for replacement', 'info');
      }
      
      // Import videos
      for (const video of importData.videos) {
        // Ensure item has ID
        if (!video.id) {
          video.id = this.generateUniqueId(video.url || '', video.fullUrl || '');
        }
        
        // Check if video exists
        if (!replace && this.state.videoCache.has(video.id)) {
          result.videosSkipped++;
          continue;
        }
        
        // Add to cache
        this.state.videoCache.set(video.id, video);
        result.videosAdded++;
      }
      
      // Import images
      for (const image of importData.images) {
        // Ensure item has ID
        if (!image.id) {
          image.id = this.generateUniqueId(image.url || '', image.fullUrl || '');
        }
        
        // Check if image exists
        if (!replace && this.state.imageCache.has(image.id)) {
          result.imagesSkipped++;
          continue;
        }
        
        // Add to cache
        this.state.imageCache.set(image.id, image);
        result.imagesAdded++;
      }
      
      // Log results
      const totalAdded = result.videosAdded + result.imagesAdded;
      this.log(`Import successful: Added ${totalAdded} media items (${result.videosAdded} videos, ${result.imagesAdded} images)`, 'success');
      
      // Update stats from imported data if available
      if (importData.stats) {
        if (!replace) {
          // Merge stats when not replacing
          this.state.newlyDiscoveredVideos += importData.stats.newlyDiscoveredVideos || 0;
          this.state.newlyDiscoveredImages += importData.stats.newlyDiscoveredImages || 0;
        } else {
          // Replace stats
          this.state.newlyDiscoveredVideos = importData.stats.newlyDiscoveredVideos || 0;
          this.state.newlyDiscoveredImages = importData.stats.newlyDiscoveredImages || 0;
          this.state.scrollCount = importData.stats.scrollCount || 0;
        }
      }
      
      // Update UI
      this.updateUI();
      this.displayResults();
      
      return result;
    } catch (error) {
      this.log(`Error importing JSON: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Create file input for JSON import
   * @param {Function} onSelect - Callback when file is selected
   * @returns {HTMLElement} - File input element
   */
  createFileInput(onSelect) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,application/json';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        onSelect(file);
      }
    });
    
    return fileInput;
  }
  
  /**
   * Copy all media URLs to clipboard
   */
  copyAllUrls() {
    try {
      // Combine videos and images
      const videos = Array.from(this.state.videoCache.values());
      const images = Array.from(this.state.imageCache.values());
      
      // Extract URLs
      const videoUrls = videos.map(v => v.fullUrl || v.url).filter(Boolean);
      const imageUrls = images.map(i => i.fullUrl || i.url).filter(Boolean);
      
      // Combine and format
      const allUrls = [...videoUrls, ...imageUrls].join('\n');
      
      // Copy to clipboard
      navigator.clipboard.writeText(allUrls)
        .then(() => {
          this.log(`Copied ${videoUrls.length + imageUrls.length} URLs to clipboard`, 'success');
          this.updateStatus(`Copied ${videoUrls.length + imageUrls.length} URLs to clipboard`, 'success');
        })
        .catch(err => {
          this.log(`Error copying to clipboard: ${err.message}`, 'error');
          
          // Fallback: create a textarea element to copy from
          const textarea = document.createElement('textarea');
          textarea.value = allUrls;
          textarea.style.position = 'fixed';
          textarea.style.opacity = 0;
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          
          try {
            document.execCommand('copy');
            this.log(`Copied ${videoUrls.length + imageUrls.length} URLs to clipboard (fallback)`, 'success');
            this.updateStatus(`Copied ${videoUrls.length + imageUrls.length} URLs to clipboard`, 'success');
          } catch (e) {
            this.log(`Clipboard fallback failed: ${e.message}`, 'error');
          }
          
          document.body.removeChild(textarea);
        });
    } catch (error) {
      this.log(`Error copying URLs: ${error.message}`, 'error');
    }
  }

  /**
   * Display statistics tab content
   */
  displayStats() {
    const container = document.getElementById('tab-content-stats');
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    const colors = this.colors;
    
    // Create stats container
    const statsContainer = document.createElement('div');
    statsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
      background: ${colors.card};
      border-radius: 8px;
      border: 1px solid ${colors.border};
    `;
    
    // Media counts
    const mediaSection = document.createElement('div');
    mediaSection.style.cssText = `
      margin-bottom: 16px;
    `;
    
    const mediaTitle = document.createElement('h3');
    mediaTitle.textContent = 'Media Stats';
    mediaTitle.style.cssText = `
      margin: 0 0 12px 0;
      font-size: 16px;
      color: ${colors.text};
    `;
    
    const videoCount = this.state.videoCache.size;
    const imageCount = this.state.imageCache.size;
    const totalMedia = videoCount + imageCount;
    
    const mediaCounts = document.createElement('div');
    mediaCounts.style.cssText = `
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    `;
    
    const createStatCard = (icon, count, label) => {
      const card = document.createElement('div');
      card.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: ${colors.background};
        border-radius: 8px;
        padding: 12px;
        border: 1px solid ${colors.border};
      `;
      
      const iconEl = document.createElement('div');
      iconEl.textContent = icon;
      iconEl.style.cssText = `
        font-size: 24px;
        margin-bottom: 8px;
      `;
      
      const countEl = document.createElement('div');
      countEl.textContent = count.toLocaleString();
      countEl.style.cssText = `
        font-size: 18px;
        font-weight: 600;
        color: ${colors.text};
      `;
      
      const labelEl = document.createElement('div');
      labelEl.textContent = label;
      labelEl.style.cssText = `
        font-size: 12px;
        color: ${colors.secondary};
      `;
      
      card.appendChild(iconEl);
      card.appendChild(countEl);
      card.appendChild(labelEl);
      
      return card;
    };
    
    mediaCounts.appendChild(createStatCard('📹', videoCount, 'Videos'));
    mediaCounts.appendChild(createStatCard('🖼️', imageCount, 'Images'));
    mediaCounts.appendChild(createStatCard('🔍', totalMedia, 'Total'));
    
    // Session stats
    const sessionTitle = document.createElement('h3');
    sessionTitle.textContent = 'Session Stats';
    sessionTitle.style.cssText = `
      margin: 0 0 12px 0;
      font-size: 16px;
      color: ${colors.text};
    `;
    
    const sessionStats = document.createElement('ul');
    sessionStats.style.cssText = `
      margin: 0;
      padding: 0 0 0 16px;
      list-style-type: disc;
    `;
    
    const sessionItems = [
      `Scrolls: ${this.state.scrollCount}`,
      `New videos found: ${this.state.newlyDiscoveredVideos}`,
      `New images found: ${this.state.newlyDiscoveredImages}`,
      `DOM elements: ${this.state.domElements.size}`,
      `Start time: ${this.state.startTime ? new Date(this.state.startTime).toLocaleTimeString() : 'N/A'}`
    ];
    
    sessionItems.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      li.style.cssText = `
        margin-bottom: 8px;
        color: ${colors.text};
        font-size: 14px;
      `;
      sessionStats.appendChild(li);
    });
    
    // Error stats
    const errorTitle = document.createElement('h3');
    errorTitle.textContent = 'Error Stats';
    errorTitle.style.cssText = `
      margin: 16px 0 12px 0;
      font-size: 16px;
      color: ${colors.text};
    `;
    
    const errorStats = document.createElement('ul');
    errorStats.style.cssText = `
      margin: 0;
      padding: 0 0 0 16px;
      list-style-type: disc;
    `;
    
    const errors = this.state.errors;
    const errorItems = [
      `PWA errors suppressed: ${errors.pwa}`,
      `API errors: ${errors.api}`,
      `Network errors: ${errors.network}`,
      `Retry attempts: ${errors.retry.count}`
    ];
    
    errorItems.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      li.style.cssText = `
        margin-bottom: 8px;
        color: ${colors.text};
        font-size: 14px;
      `;
      errorStats.appendChild(li);
    });
    
    // Export and Import buttons
    const dataSection = document.createElement('div');
    dataSection.style.cssText = `
      margin-top: 16px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    `;
    
    const createButton = (icon, label, onClick) => {
      const button = document.createElement('button');
      button.style.cssText = `
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        background: ${colors.background};
        border: 1px solid ${colors.border};
        border-radius: 4px;
        color: ${colors.text};
        font-size: 14px;
        cursor: pointer;
      `;
      
      const iconEl = document.createElement('span');
      iconEl.textContent = icon;
      
      const labelEl = document.createElement('span');
      labelEl.textContent = label;
      
      button.appendChild(iconEl);
      button.appendChild(labelEl);
      button.onclick = onClick;
      
      return button;
    };
    
    // File input for import (hidden)
    const fileInput = this.createFileInput(async (file) => {
      try {
        // Show confirmation modal
        const shouldReplace = confirm("Replace existing data? Click OK to replace, Cancel to merge with existing data.");
        
        // Import the data
        this.updateStatus('Importing data...', 'info');
        const result = await this.importJsonData(file, shouldReplace);
        
        // Show results
        this.updateStatus(`Import successful! Added ${result.videosAdded} videos and ${result.imagesAdded} images.`, 'success');
      } catch (error) {
        this.updateStatus(`Import failed: ${error.message}`, 'error');
      }
    });
    document.body.appendChild(fileInput);
    
    // Export functions
    const exportCsv = () => {
      this.exportDataAsCsv();
    };
    
    const exportJson = () => {
      this.exportDataAsJson();
    };
    
    const importJson = () => {
      fileInput.click(); // Open file dialog
    };
    
    const copyUrls = () => {
      this.copyAllUrls();
    };
    
    // Create buttons
    dataSection.appendChild(createButton('📥', 'Import JSON', importJson));
    dataSection.appendChild(createButton('📊', 'Export CSV', exportCsv));
    dataSection.appendChild(createButton('📋', 'Export JSON', exportJson));
    dataSection.appendChild(createButton('🔗', 'Copy URLs', copyUrls));
    
    // Assemble stats view
    mediaSection.appendChild(mediaTitle);
    mediaSection.appendChild(mediaCounts);
    
    statsContainer.appendChild(mediaSection);
    statsContainer.appendChild(sessionTitle);
    statsContainer.appendChild(sessionStats);
    statsContainer.appendChild(errorTitle);
    statsContainer.appendChild(errorStats);
    statsContainer.appendChild(dataSection);
    
    container.appendChild(statsContainer);
  }

  /**
   * Create the filter component for media items
   * @param {Element} container - Container element
   * @param {Object} colors - Color scheme
   */
  createFilterComponent(container, colors) {
    // Create filter container
    const filterContainer = document.createElement('div');
    filterContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px;
      background: ${colors.card};
      border-radius: 4px;
    `;

    // Search input
    const searchContainer = document.createElement('div');
    searchContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      background: ${colors.background};
      border: 1px solid ${colors.border};
      border-radius: 20px;
      padding: 6px 12px;
    `;

    const searchIcon = document.createElement('span');
    searchIcon.textContent = '🔍';
    searchIcon.style.fontSize = '14px';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search media...';
    searchInput.style.cssText = `
      flex: 1;
      border: none;
      background: none;
      color: ${colors.text};
      font-size: 14px;
      outline: none;
      padding: 0;
    `;
    
    // Set value from state
    searchInput.value = this.state.searchQuery;

    // Filter options row
    const optionsRow = document.createElement('div');
    optionsRow.style.cssText = `
      display: flex;
      gap: 8px;
      margin-top: 8px;
    `;

    // Sort order dropdown
    const sortContainer = document.createElement('div');
    sortContainer.style.cssText = `
      flex: 1;
    `;

    const sortLabel = document.createElement('label');
    sortLabel.textContent = 'Sort by:';
    sortLabel.style.cssText = `
      display: block;
      margin-bottom: 4px;
      font-size: 12px;
      color: ${colors.secondary};
    `;

    const sortSelect = document.createElement('select');
    sortSelect.style.cssText = `
      width: 100%;
      padding: 6px 8px;
      background: ${colors.background};
      border: 1px solid ${colors.border};
      border-radius: 4px;
      color: ${colors.text};
      font-size: 14px;
    `;

    const sortOptions = [
      { value: 'newest', label: 'Newest first' },
      { value: 'oldest', label: 'Oldest first' },
      { value: 'duration', label: 'Longest duration' },
      { value: 'likes', label: 'Most likes' },
      { value: 'retweets', label: 'Most retweets' },
      { value: 'views', label: 'Most views' }
    ];

    sortOptions.forEach(option => {
      const optionEl = document.createElement('option');
      optionEl.value = option.value;
      optionEl.textContent = option.label;
      optionEl.selected = this.state.sortOrder === option.value;
      sortSelect.appendChild(optionEl);
    });

    sortSelect.addEventListener('change', () => {
      this.state.sortOrder = sortSelect.value;
      this.displayResults();
    });

    // Assemble sort container
    sortContainer.appendChild(sortLabel);
    sortContainer.appendChild(sortSelect);

    // Event listeners
    searchInput.addEventListener('input', () => {
      this.state.searchQuery = searchInput.value.toLowerCase();
      this.displayResults();
    });

    // Assemble components
    searchContainer.appendChild(searchIcon);
    searchContainer.appendChild(searchInput);

    filterContainer.appendChild(searchContainer);
    filterContainer.appendChild(optionsRow);
    filterContainer.appendChild(sortContainer);

    // Add to container
    container.appendChild(filterContainer);
  }

  /**
   * Update tab counts with current media numbers
   */
  updateTabCounts() {
    const videoCount = this.state.videoCache.size;
    const imageCount = this.state.imageCache.size;
    
    // Find tab elements
    const videosTab = document.querySelector('#tab-videos');
    const imagesTab = document.querySelector('#tab-images');
    
    // Update tab text with counts
    if (videosTab) {
      videosTab.textContent = `Videos (${videoCount})`;
    }
    
    if (imagesTab) {
      imagesTab.textContent = `Images (${imageCount})`;
    }
  }

  /**
   * Display results based on current tab and filters
   */
  displayResults() {
    const currentTab = this.state.currentTab;
    
    try {
      switch (currentTab) {
        case 'videos':
          this.displayVideos();
          break;
        case 'images':
          this.displayImages();
          break;
        case 'stats':
          this.displayStats();
          break;
        default:
          this.log(`Unknown tab: ${currentTab}`, 'error');
      }
    } catch (error) {
      this.log(`Error displaying results: ${error.message}`, 'error');
      console.error('Display error:', error);
    }
  }

  /**
   * Display videos tab content
   */
  displayVideos() {
    const container = document.getElementById('tab-content-videos');
    if (!container) return;
    
    // Get filtered and sorted videos
    const videos = this.videos;
    
    // Create virtual scroller
    this.createVirtualScroller(container, videos, this.renderVideoCard.bind(this), this.colors);
  }

  /**
   * Display images tab content
   */
  displayImages() {
    const container = document.getElementById('tab-content-images');
    if (!container) return;
    
    // Get filtered and sorted images
    const images = this.images;
    
    // Create virtual scroller
    this.createVirtualScroller(container, images, this.renderImageCard.bind(this), this.colors);
  }

  /**
   * Create a virtual scroller for displaying a large number of items
   * @param {Element} container - Container element
   * @param {Array} items - Items to display
   * @param {Function} renderItem - Function to render each item
   * @param {Object} colors - Color scheme
   */
  createVirtualScroller(container, items, renderItem, colors) {
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    if (!items || items.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.style.cssText = `
        padding: 32px;
        text-align: center;
        color: ${colors.secondary};
        font-size: 16px;
      `;
      emptyMessage.textContent = 'No items found. Try adjusting your filters or scroll to analyze more content.';
      container.appendChild(emptyMessage);
      return;
    }
    
    // Calculate visible items based on container height
    const itemsPerPage = this.config.itemsPerPage || 50;
    const totalPages = Math.ceil(items.length / itemsPerPage);
    
    // Create items container
    const itemsContainer = document.createElement('div');
    itemsContainer.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
      padding: 16px;
    `;
    
    // Render current page
    const startIndex = (this.state.currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, items.length);
    
    const visibleItems = items.slice(startIndex, endIndex);
    
    visibleItems.forEach(item => {
      const itemElement = renderItem(item);
      itemsContainer.appendChild(itemElement);
    });
    
    container.appendChild(itemsContainer);
    
    // Create pagination if needed
    if (totalPages > 1) {
      const pagination = document.createElement('div');
      pagination.style.cssText = `
        display: flex;
        justify-content: center;
        padding: 16px;
        gap: 8px;
      `;
      
      // Previous button
      const prevButton = document.createElement('button');
      prevButton.textContent = '← Previous';
      prevButton.disabled = this.state.currentPage === 1;
      prevButton.style.cssText = `
        padding: 8px 16px;
        background: ${colors.background};
        color: ${prevButton.disabled ? colors.secondary : colors.text};
        border: 1px solid ${colors.border};
        border-radius: 4px;
        cursor: ${prevButton.disabled ? 'default' : 'pointer'};
        opacity: ${prevButton.disabled ? 0.5 : 1};
      `;
      
      if (!prevButton.disabled) {
        prevButton.onclick = () => {
          this.state.currentPage = Math.max(1, this.state.currentPage - 1);
          this.displayResults();
        };
      }
      
      // Page info
      const pageInfo = document.createElement('div');
      pageInfo.textContent = `Page ${this.state.currentPage} of ${totalPages}`;
      pageInfo.style.cssText = `
        display: flex;
        align-items: center;
        padding: 0 16px;
        color: ${colors.text};
      `;
      
      // Next button
      const nextButton = document.createElement('button');
      nextButton.textContent = 'Next →';
      nextButton.disabled = this.state.currentPage === totalPages;
      nextButton.style.cssText = `
        padding: 8px 16px;
        background: ${colors.background};
        color: ${nextButton.disabled ? colors.secondary : colors.text};
        border: 1px solid ${colors.border};
        border-radius: 4px;
        cursor: ${nextButton.disabled ? 'default' : 'pointer'};
        opacity: ${nextButton.disabled ? 0.5 : 1};
      `;
      
      if (!nextButton.disabled) {
        nextButton.onclick = () => {
          this.state.currentPage = Math.min(totalPages, this.state.currentPage + 1);
          this.displayResults();
        };
      }
      
      pagination.appendChild(prevButton);
      pagination.appendChild(pageInfo);
      pagination.appendChild(nextButton);
      
      container.appendChild(pagination);
    }
  }

  /**
   * Switch between tabs
   * @param {string} tabId - The ID of the tab to switch to
   */
  switchTab(tabId) {
    if (!tabId || typeof tabId !== 'string') {
      this.log('Invalid tab ID', 'warning');
      return;
    }
    
    // Update current tab state
    this.state.currentTab = tabId;
    
    // Get all tab buttons and content
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');
    
    // Update tab styling
    tabs.forEach(tab => {
      const isActive = tab.getAttribute('data-tab') === tabId;
      tab.style.color = isActive ? this.colors.primary : this.colors.text;
      tab.style.borderBottom = isActive ? `2px solid ${this.colors.primary}` : 'none';
      tab.style.marginBottom = isActive ? '-2px' : '0';
      tab.style.fontWeight = isActive ? '600' : '400';
    });
    
    // Show/hide content
    contents.forEach(content => {
      content.style.display = content.getAttribute('data-tab') === tabId ? 'block' : 'none';
    });
    
    // Display appropriate content
    this.displayResults();
  }

  /**
   * Update the UI with current data
   * Refreshes all tab content and status
   */
  updateUI() {
    try {
      // Update tab counts
      this.updateTabCounts();
      
      // Update displayed content based on current tab
      this.displayResults();
      
      // Update status
      const totalVideos = this.state.videoCache.size;
      const totalImages = this.state.imageCache.size;
      const totalItems = totalVideos + totalImages;
      
      this.updateStatus(`Found ${totalItems} items (${totalVideos} videos, ${totalImages} images) in ${this.state.scrollCount} scrolls`);
    } catch (error) {
      this.log(`Error updating UI: ${error.message}`, 'error');
    }
  }
}

// Auto-initialize when pasted into browser console
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedTwitterMediaAnalyzer;
} else {
  // Auto-initialize in browser environment
  (function() {
    try {
      console.log('Twitter Media Analyzer: Initializing...');
      window.twitterMediaAnalyzer = new EnhancedTwitterMediaAnalyzer();
      window.twitterMediaAnalyzer.createInterface();
      console.log('Twitter Media Analyzer: Ready! Use twitterMediaAnalyzer.start() to begin analysis.');
    } catch (error) {
      console.error('Twitter Media Analyzer initialization failed:', error);
    }
  })();
}