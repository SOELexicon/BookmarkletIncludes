BMS.runHtmlAnalyser = async function() {
  // Ensure the BMS suite is loaded
  if (!window.BMS) {
    alert("Bookmarklet Suite not found!");
    return;
  }

  // Load required components
  try {
    await BMS.loadComponents([
      'core/panel/panel',
      'data-display/table/table',
      'interactive/animation-effects/animations'
    ]);
  } catch (error) {
    console.error('Failed to load components:', error);
    // Fall back to basic UI if components fail to load
  }

  function getClassName(e) {
    if (e.className) {
      if (typeof e.className === 'object' && e.className.baseVal !== undefined) {
        return e.className.baseVal;
      } else if (typeof e.className === 'string') {
        return e.className;
      }
    }
    return "";
  }

  function detectFrameworks() {
    const frameworks = [];
    const detectedFrameworks = [];

    // React detection
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || document.querySelector('[data-reactroot], [data-reactid], [data-react-helmet]')) {
      detectedFrameworks.push({
        name: 'React',
        confidence: 'High',
        indicators: 'React DevTools detected',
        icon: '⚛️'
      });
    }

    // Angular detection
    if (window.ng || document.querySelector('[ng-app], [ng-controller], [ng-model]') || document.querySelector('*[class*="ng-"]')) {
      detectedFrameworks.push({
        name: 'Angular',
        confidence: 'High',
        indicators: 'Angular directives found',
        icon: '🅰️'
      });
    }

    // Vue detection
    if (window.__VUE__ || document.querySelector('[v-app], [v-bind], [v-model], [v-if]') || document.querySelector('*[class*="v-"]')) {
      detectedFrameworks.push({
        name: 'Vue',
        confidence: 'High',
        indicators: 'Vue directives found',
        icon: '✅'
      });
    }

    // Svelte detection
    if (document.querySelector('[class*="svelte-"]')) {
      detectedFrameworks.push({
        name: 'Svelte',
        confidence: 'Medium',
        indicators: 'Svelte class markers',
        icon: '🔥'
      });
    }

    // jQuery detection
    if (window.jQuery || window.$) {
      const version = window.jQuery ? window.jQuery.fn.jquery : 'Unknown';
      detectedFrameworks.push({
        name: 'jQuery',
        confidence: 'High',
        indicators: `Version ${version}`,
        icon: '💲'
      });
    }

    // CSS Framework detection
    if (document.querySelector('.container, .row, .col, .navbar, .btn-primary')) {
      detectedFrameworks.push({
        name: 'Bootstrap',
        confidence: 'Medium',
        indicators: 'Bootstrap classes detected',
        icon: '🅱️'
      });
    }

    // Tailwind detection
    const hasTailwind = Array.from(document.querySelectorAll('*')).some(e => {
      const classes = getClassName(e).split(' ');
      return classes.length > 3 && classes.some(c => /^(bg-|text-|p-|m-|flex|grid|border-|rounded-|shadow-|hover:)/.test(c));
    });
    if (hasTailwind) {
      detectedFrameworks.push({
        name: 'Tailwind CSS',
        confidence: 'High',
        indicators: 'Utility classes detected',
        icon: '🎨'
      });
    }

    // Material UI detection
    if (document.querySelector('.MuiButton-root, .MuiAppBar-root, .MuiTextField-root')) {
      detectedFrameworks.push({
        name: 'Material UI',
        confidence: 'High',
        indicators: 'MUI components detected',
        icon: '📦'
      });
    }

    // Ant Design detection
    if (document.querySelector('.ant-btn, .ant-table, .ant-form')) {
      detectedFrameworks.push({
        name: 'Ant Design',
        confidence: 'High',
        indicators: 'Ant Design components',
        icon: '🐜'
      });
    }

    // Chakra UI detection
    if (document.querySelector('[class^="chakra-"]')) {
      detectedFrameworks.push({
        name: 'Chakra UI',
        confidence: 'High',
        indicators: 'Chakra components detected',
        icon: '⚡'
      });
    }

    return detectedFrameworks;
  }

  function getMetaTags() {
    const metaTags = [];
    document.querySelectorAll('meta').forEach(meta => {
      const name = meta.getAttribute('name') || meta.getAttribute('property') || meta.getAttribute('http-equiv');
      const content = meta.getAttribute('content');
      const charset = meta.getAttribute('charset');

      if (charset) {
        metaTags.push({
          type: 'Charset',
          name: 'charset',
          content: charset,
          category: 'Document'
        });
      } else if (name && content) {
        let category = 'General';

        // Categorize meta tags
        if (name.startsWith('og:')) category = 'Open Graph';
        else if (name.startsWith('twitter:')) category = 'Twitter';
        else if (name.startsWith('fb:') || name.startsWith('article:')) category = 'Facebook';
        else if (['viewport', 'robots', 'theme-color'].includes(name)) category = 'Technical';
        else if (['description', 'keywords', 'author'].includes(name)) category = 'SEO';

        metaTags.push({
          type: category,
          name: name,
          content: content.length > 100 ? content.substring(0, 100) + '...' : content,
          fullContent: content,
          category: category
        });
      }
    });
    return metaTags;
  }

  function getPageInfo() {
    return {
      title: document.title || 'No title',
      url: window.location.href,
      domain: window.location.hostname,
      protocol: window.location.protocol.replace(':', ''),
      language: document.documentElement.lang || 'Not specified',
      charset: document.characterSet || 'Not specified',
      doctype: document.doctype ? 'HTML5' : 'No DOCTYPE',
      scripts: document.querySelectorAll('script').length,
      stylesheets: document.querySelectorAll('link[rel="stylesheet"]').length,
      images: document.querySelectorAll('img').length,
      links: document.querySelectorAll('a').length
    };
  }

  function generateContent() {
    const frameworks = detectFrameworks();
    const metaTags = getMetaTags();
    const pageInfo = getPageInfo();

    // Use enhanced components if available
    if (BMS.UI.Components && BMS.UI.Components.Table) {
      return generateEnhancedContent(frameworks, metaTags, pageInfo);
    } else {
      // Fallback to basic content
      return generateBasicContent(frameworks, metaTags, pageInfo);
    }
  }

  function generateEnhancedContent(frameworks, metaTags, pageInfo) {
    const container = document.createElement('div');
    container.className = 'html-analyser-content';
    container.style.width = '100%';

    // Page Info Section
    const infoSection = document.createElement('div');
    infoSection.innerHTML = `
      <div style="padding: 16px; background: rgba(255,255,255,0.03); border-radius: 8px; margin-bottom: 16px;">
        <h3 style="margin: 0 0 12px 0; color: #667eea;">📊 Page Information</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px;">
          <div><strong>Title:</strong> ${pageInfo.title}</div>
          <div><strong>Domain:</strong> ${pageInfo.domain}</div>
          <div><strong>Language:</strong> ${pageInfo.language}</div>
          <div><strong>Protocol:</strong> ${pageInfo.protocol.toUpperCase()}</div>
          <div><strong>Scripts:</strong> ${pageInfo.scripts}</div>
          <div><strong>Stylesheets:</strong> ${pageInfo.stylesheets}</div>
          <div><strong>Images:</strong> ${pageInfo.images}</div>
          <div><strong>Links:</strong> ${pageInfo.links}</div>
        </div>
      </div>
    `;
    container.appendChild(infoSection);

    // Tabs for different sections
    const tabContainer = document.createElement('div');
    tabContainer.className = 'bms-panel-tabs';
    tabContainer.style.marginBottom = '16px';

    const tabs = [
      { id: 'frameworks', label: '🚀 Frameworks', active: true },
      { id: 'metatags', label: '🏷️ Meta Tags', active: false }
    ];

    const tabButtons = document.createElement('div');
    tabButtons.style.display = 'flex';
    tabButtons.style.gap = '8px';
    tabButtons.style.borderBottom = '2px solid #3a3a3a';
    tabButtons.style.marginBottom = '16px';

    tabs.forEach(tab => {
      const btn = document.createElement('button');
      btn.textContent = tab.label;
      btn.style.cssText = `
        padding: 8px 16px;
        background: ${tab.active ? '#667eea' : 'transparent'};
        color: ${tab.active ? 'white' : '#999'};
        border: none;
        border-radius: 8px 8px 0 0;
        cursor: pointer;
        transition: all 0.2s;
      `;
      btn.onclick = () => switchTab(tab.id);
      tabButtons.appendChild(btn);
    });

    container.appendChild(tabButtons);

    // Content areas
    const contentArea = document.createElement('div');
    contentArea.id = 'analyser-content-area';
    container.appendChild(contentArea);

    // Function to switch tabs
    const switchTab = (tabId) => {
      // Update button styles
      const buttons = tabButtons.querySelectorAll('button');
      buttons.forEach((btn, index) => {
        const isActive = tabs[index].id === tabId;
        btn.style.background = isActive ? '#667eea' : 'transparent';
        btn.style.color = isActive ? 'white' : '#999';
      });

      // Update content
      contentArea.innerHTML = '';

      if (tabId === 'frameworks') {
        if (frameworks.length > 0) {
          const table = BMS.UI.Components.Table.create({
            columns: [
              { key: 'icon', title: '', width: '40px' },
              { key: 'name', title: 'Framework', sortable: true },
              { key: 'confidence', title: 'Confidence', sortable: true },
              { key: 'indicators', title: 'Indicators' }
            ],
            data: frameworks,
            searchable: false,
            paginate: false,
            sortable: true,
            selectable: false,
            striped: true,
            hover: true,
            dark: true
          });
          contentArea.appendChild(table);
        } else {
          contentArea.innerHTML = '<p style="color: #999; padding: 20px;">No frameworks detected on this page.</p>';
        }
      } else if (tabId === 'metatags') {
        if (metaTags.length > 0) {
          const table = BMS.UI.Components.Table.create({
            columns: [
              { key: 'category', title: 'Category', sortable: true, width: '120px' },
              { key: 'name', title: 'Name', sortable: true },
              {
                key: 'content',
                title: 'Content',
                renderer: (value, row) => {
                  if (row.fullContent && row.fullContent.length > 100) {
                    return `
                      <span title="${row.fullContent.replace(/"/g, '&quot;')}" style="cursor: help;">
                        ${value}
                      </span>
                    `;
                  }
                  return value;
                }
              }
            ],
            data: metaTags,
            searchable: true,
            paginate: metaTags.length > 10,
            pageSize: 10,
            sortable: true,
            selectable: false,
            filterable: true,
            striped: true,
            hover: true,
            dark: true
          });
          contentArea.appendChild(table);
        } else {
          contentArea.innerHTML = '<p style="color: #999; padding: 20px;">No meta tags found on this page.</p>';
        }
      }
    };

    // Initialize with frameworks tab
    switchTab('frameworks');

    return container;
  }

  function generateBasicContent(frameworks, metaTags, pageInfo) {
    // Fallback to original tabbed content
    const tabs = [];

    // Page info tab
    let infoContent = '<div style="padding: 10px;">';
    infoContent += `<p><strong>Title:</strong> ${pageInfo.title}</p>`;
    infoContent += `<p><strong>URL:</strong> ${pageInfo.url}</p>`;
    infoContent += `<p><strong>Language:</strong> ${pageInfo.language}</p>`;
    infoContent += `<p><strong>Resources:</strong> ${pageInfo.scripts} scripts, ${pageInfo.stylesheets} stylesheets</p>`;
    infoContent += '</div>';
    tabs.push({ title: 'Page Info', content: infoContent });

    // Frameworks tab
    if (frameworks.length > 0) {
      let frameworkContent = '<ul>';
      for (const fw of frameworks) {
        frameworkContent += `<li>${fw.icon} <strong>${fw.name}</strong> - ${fw.indicators}</li>`;
      }
      frameworkContent += '</ul>';
      tabs.push({ title: 'Frameworks', content: frameworkContent });
    }

    // Meta tags tab
    if (metaTags.length > 0) {
      let metaContent = '<table style="width: 100%;">';
      metaContent += '<tr><th>Category</th><th>Name</th><th>Content</th></tr>';
      for (const tag of metaTags) {
        metaContent += `<tr>
          <td style="padding: 4px;"><small>${tag.category}</small></td>
          <td style="padding: 4px;"><strong>${tag.name}</strong></td>
          <td style="padding: 4px;">${tag.content}</td>
        </tr>`;
      }
      metaContent += '</table>';
      tabs.push({ title: 'Meta Tags', content: metaContent });
    }

    if (tabs.length === 0) {
      return '<p>No data detected on this page.</p>';
    }

    return tabs;
  }

  // Create the panel using enhanced components or fallback
  const content = generateContent();

  if (BMS.UI.Components && BMS.UI.Components.Panel) {
    // Use enhanced panel
    const panel = BMS.UI.Components.Panel.create({
      title: '🔍 HTML Analyser',
      content: content,
      position: { top: 50, left: window.innerWidth - 850 },
      size: { width: 800, height: 600 },
      animation: true,
      theme: 'dark',
      maximizable: true,
      onClose: (panel) => {
        if (BMS.UI.Animations) {
          BMS.UI.Animations.fadeOut(panel, { duration: 200 });
        }
      }
    });

    // Add animation
    if (BMS.UI.Animations) {
      BMS.UI.Animations.slide(panel, 'down', {
        duration: 300,
        distance: 20
      });
    }
  } else {
    // Fallback to basic panel
    BMS.UI.createPanel({
      id: 'html-analyser-panel',
      title: '🔍 HTML Analyser',
      content: content,
      footer: '<button class="bms-button" onclick="document.getElementById(\'html-analyser-panel\').remove()">Close</button>'
    });
  }
};

// Run the analyser
BMS.runHtmlAnalyser();