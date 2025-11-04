BMS.runJsonExtract = async function() {
  // Ensure the BMS suite is loaded
  if (!window.BMS) {
    alert("Bookmarklet Suite not found!");
    return;
  }

  // Load required components
  try {
    await BMS.loadComponents([
      'core/panel/panel',
      'core/modal/modal',
      'interactive/animation-effects/animations'
    ]);
  } catch (error) {
    console.error('Failed to load components:', error);
    // Fall back to basic UI if components fail to load
  }

  function extractJsonLd() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const results = [];

    scripts.forEach((script, index) => {
      try {
        const jsonData = JSON.parse(script.textContent);
        results.push({
          index: index + 1,
          type: jsonData['@type'] || 'Unknown',
          context: jsonData['@context'] || 'None',
          data: jsonData,
          raw: script.textContent
        });
      } catch (e) {
        results.push({
          index: index + 1,
          type: 'Error',
          context: 'Parse Error',
          data: null,
          raw: script.textContent,
          error: e.message
        });
      }
    });

    return results;
  }

  function extractOpenGraph() {
    const metaTags = document.querySelectorAll('meta[property^="og:"], meta[name^="og:"]');
    const ogData = {};

    metaTags.forEach(tag => {
      const property = tag.getAttribute('property') || tag.getAttribute('name');
      const content = tag.getAttribute('content');
      if (property && content) {
        ogData[property] = content;
      }
    });

    return Object.keys(ogData).length > 0 ? ogData : null;
  }

  function extractTwitterCard() {
    const metaTags = document.querySelectorAll('meta[property^="twitter:"], meta[name^="twitter:"]');
    const twitterData = {};

    metaTags.forEach(tag => {
      const property = tag.getAttribute('property') || tag.getAttribute('name');
      const content = tag.getAttribute('content');
      if (property && content) {
        twitterData[property] = content;
      }
    });

    return Object.keys(twitterData).length > 0 ? twitterData : null;
  }

  function extractMicrodata() {
    const items = document.querySelectorAll('[itemscope]');
    const microdata = [];

    items.forEach((item, index) => {
      const itemType = item.getAttribute('itemtype');
      const props = {};

      item.querySelectorAll('[itemprop]').forEach(prop => {
        const propName = prop.getAttribute('itemprop');
        const propValue = prop.getAttribute('content') ||
                         prop.getAttribute('href') ||
                         prop.textContent.trim();

        if (props[propName]) {
          if (!Array.isArray(props[propName])) {
            props[propName] = [props[propName]];
          }
          props[propName].push(propValue);
        } else {
          props[propName] = propValue;
        }
      });

      if (Object.keys(props).length > 0) {
        microdata.push({
          index: index + 1,
          type: itemType || 'Unknown',
          properties: props
        });
      }
    });

    return microdata;
  }

  function formatJson(obj, indent = 2) {
    try {
      return JSON.stringify(obj, null, indent);
    } catch (e) {
      return 'Error formatting JSON: ' + e.message;
    }
  }

  function copyToClipboard(text) {
    if (BMS.Utils && BMS.Utils.copyToClipboard) {
      BMS.Utils.copyToClipboard(text);
      showNotification('Copied to clipboard!', 'success');
    } else {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Copied to clipboard!');
    }
  }

  function showNotification(message, type = 'info') {
    if (BMS.UI && BMS.UI.updateStatus) {
      BMS.UI.updateStatus(message, type);
    }
  }

  function generateEnhancedContent(jsonLd, openGraph, twitterCard, microdata) {
    const container = document.createElement('div');
    container.className = 'json-extract-content';
    container.style.width = '100%';

    // Summary section
    const summary = document.createElement('div');
    summary.innerHTML = `
      <div style="padding: 16px; background: rgba(102, 126, 234, 0.1); border-radius: 8px; margin-bottom: 16px; border: 1px solid rgba(102, 126, 234, 0.3);">
        <h3 style="margin: 0 0 12px 0; color: #667eea;">📊 Structured Data Summary</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
          <div style="text-align: center; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 6px;">
            <div style="font-size: 24px; font-weight: bold; color: #667eea;">${jsonLd.length}</div>
            <div style="font-size: 12px; color: #999;">JSON-LD Scripts</div>
          </div>
          <div style="text-align: center; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 6px;">
            <div style="font-size: 24px; font-weight: bold; color: #00c851;">${openGraph ? Object.keys(openGraph).length : 0}</div>
            <div style="font-size: 12px; color: #999;">Open Graph Tags</div>
          </div>
          <div style="text-align: center; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 6px;">
            <div style="font-size: 24px; font-weight: bold; color: #1da1f2;">${twitterCard ? Object.keys(twitterCard).length : 0}</div>
            <div style="font-size: 12px; color: #999;">Twitter Card Tags</div>
          </div>
          <div style="text-align: center; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 6px;">
            <div style="font-size: 24px; font-weight: bold; color: #ff9800;">${microdata.length}</div>
            <div style="font-size: 12px; color: #999;">Microdata Items</div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(summary);

    // Tabs
    const tabs = [
      { id: 'jsonld', label: '🔷 JSON-LD', count: jsonLd.length, active: true },
      { id: 'opengraph', label: '📘 Open Graph', count: openGraph ? Object.keys(openGraph).length : 0, active: false },
      { id: 'twitter', label: '🐦 Twitter Card', count: twitterCard ? Object.keys(twitterCard).length : 0, active: false },
      { id: 'microdata', label: '🏷️ Microdata', count: microdata.length, active: false }
    ];

    const tabButtons = document.createElement('div');
    tabButtons.style.cssText = 'display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 2px solid #3a3a3a; padding-bottom: 2px;';

    tabs.forEach(tab => {
      const btn = document.createElement('button');
      btn.innerHTML = `${tab.label} <span style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 10px; font-size: 11px; margin-left: 4px;">${tab.count}</span>`;
      btn.style.cssText = `
        padding: 8px 16px;
        background: ${tab.active ? '#667eea' : 'transparent'};
        color: ${tab.active ? 'white' : '#999'};
        border: none;
        border-radius: 8px 8px 0 0;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 13px;
        font-weight: 500;
      `;
      btn.onclick = () => switchTab(tab.id);
      btn.dataset.tabId = tab.id;
      tabButtons.appendChild(btn);
    });

    container.appendChild(tabButtons);

    // Content area
    const contentArea = document.createElement('div');
    contentArea.id = 'json-content-area';
    contentArea.style.cssText = 'max-height: 400px; overflow-y: auto; padding: 16px; background: rgba(0,0,0,0.2); border-radius: 8px;';
    container.appendChild(contentArea);

    // Function to switch tabs
    const switchTab = (tabId) => {
      tabButtons.querySelectorAll('button').forEach(btn => {
        const isActive = btn.dataset.tabId === tabId;
        btn.style.background = isActive ? '#667eea' : 'transparent';
        btn.style.color = isActive ? 'white' : '#999';
      });

      contentArea.innerHTML = '';

      if (tabId === 'jsonld') {
        if (jsonLd.length > 0) {
          jsonLd.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.style.cssText = 'margin-bottom: 16px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);';

            const header = document.createElement('div');
            header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;';

            const typeLabel = document.createElement('span');
            typeLabel.style.cssText = 'font-weight: bold; color: #667eea;';
            typeLabel.textContent = `#${item.index} - Type: ${item.type}${item.error ? ' [Parse Error]' : ''}`;

            const copyBtn = document.createElement('button');
            copyBtn.textContent = '📋 Copy';
            copyBtn.style.cssText = 'padding: 4px 8px; background: rgba(102,126,234,0.2); border: 1px solid rgba(102,126,234,0.4); border-radius: 4px; color: #667eea; cursor: pointer; font-size: 12px;';
            copyBtn.onclick = () => copyToClipboard(formatJson(item.data || item.raw));

            header.appendChild(typeLabel);
            header.appendChild(copyBtn);
            itemDiv.appendChild(header);

            const pre = document.createElement('pre');
            pre.style.cssText = 'margin: 0; padding: 8px; background: rgba(0,0,0,0.3); border-radius: 4px; overflow-x: auto; font-size: 12px; line-height: 1.4;';
            pre.textContent = item.error ? item.error + '\n\nRaw:\n' + item.raw : formatJson(item.data);
            itemDiv.appendChild(pre);

            contentArea.appendChild(itemDiv);
          });
        } else {
          contentArea.innerHTML = '<p style="color: #999; text-align: center;">No JSON-LD data found.</p>';
        }
      } else if (tabId === 'opengraph') {
        if (openGraph) {
          const pre = document.createElement('pre');
          pre.style.cssText = 'margin: 0; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 6px; overflow-x: auto; font-size: 12px;';
          pre.textContent = formatJson(openGraph);
          contentArea.appendChild(pre);

          const copyBtn = document.createElement('button');
          copyBtn.textContent = '📋 Copy All';
          copyBtn.style.cssText = 'margin-top: 12px; padding: 8px 16px; background: rgba(102,126,234,0.2); border: 1px solid rgba(102,126,234,0.4); border-radius: 6px; color: #667eea; cursor: pointer;';
          copyBtn.onclick = () => copyToClipboard(formatJson(openGraph));
          contentArea.appendChild(copyBtn);
        } else {
          contentArea.innerHTML = '<p style="color: #999; text-align: center;">No Open Graph data found.</p>';
        }
      } else if (tabId === 'twitter') {
        if (twitterCard) {
          const pre = document.createElement('pre');
          pre.style.cssText = 'margin: 0; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 6px; overflow-x: auto; font-size: 12px;';
          pre.textContent = formatJson(twitterCard);
          contentArea.appendChild(pre);

          const copyBtn = document.createElement('button');
          copyBtn.textContent = '📋 Copy All';
          copyBtn.style.cssText = 'margin-top: 12px; padding: 8px 16px; background: rgba(102,126,234,0.2); border: 1px solid rgba(102,126,234,0.4); border-radius: 6px; color: #667eea; cursor: pointer;';
          copyBtn.onclick = () => copyToClipboard(formatJson(twitterCard));
          contentArea.appendChild(copyBtn);
        } else {
          contentArea.innerHTML = '<p style="color: #999; text-align: center;">No Twitter Card data found.</p>';
        }
      } else if (tabId === 'microdata') {
        if (microdata.length > 0) {
          microdata.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.style.cssText = 'margin-bottom: 16px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);';

            const header = document.createElement('div');
            header.style.cssText = 'font-weight: bold; color: #ff9800; margin-bottom: 8px;';
            header.textContent = `#${item.index} - Type: ${item.type}`;
            itemDiv.appendChild(header);

            const pre = document.createElement('pre');
            pre.style.cssText = 'margin: 0; padding: 8px; background: rgba(0,0,0,0.3); border-radius: 4px; overflow-x: auto; font-size: 12px;';
            pre.textContent = formatJson(item.properties);
            itemDiv.appendChild(pre);

            contentArea.appendChild(itemDiv);
          });
        } else {
          contentArea.innerHTML = '<p style="color: #999; text-align: center;">No Microdata found.</p>';
        }
      }
    };

    switchTab('jsonld');

    // Export button
    const exportBtn = document.createElement('button');
    exportBtn.innerHTML = '💾 Export All Data';
    exportBtn.style.cssText = 'margin-top: 16px; padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; border-radius: 6px; color: white; font-weight: 500; cursor: pointer; width: 100%; transition: transform 0.2s;';
    exportBtn.onmouseover = () => exportBtn.style.transform = 'translateY(-2px)';
    exportBtn.onmouseout = () => exportBtn.style.transform = 'translateY(0)';
    exportBtn.onclick = () => {
      const allData = { jsonLd, openGraph, twitterCard, microdata, url: window.location.href, timestamp: new Date().toISOString() };
      copyToClipboard(formatJson(allData));
    };
    container.appendChild(exportBtn);

    return container;
  }

  function generateBasicContent(jsonLd, openGraph, twitterCard, microdata) {
    const tabs = [];

    if (jsonLd.length > 0) {
      let content = '<div>';
      jsonLd.forEach((item, i) => {
        content += `<h4>#${i + 1} - ${item.type}</h4><pre style="white-space: pre-wrap;">${formatJson(item.data)}</pre>`;
      });
      content += '</div>';
      tabs.push({ title: `JSON-LD (${jsonLd.length})`, content });
    }

    if (openGraph) {
      tabs.push({ title: 'Open Graph', content: `<pre>${formatJson(openGraph)}</pre>` });
    }

    if (twitterCard) {
      tabs.push({ title: 'Twitter Card', content: `<pre>${formatJson(twitterCard)}</pre>` });
    }

    if (microdata.length > 0) {
      let content = '<div>';
      microdata.forEach((item, i) => {
        content += `<h4>#${i + 1} - ${item.type}</h4><pre>${formatJson(item.properties)}</pre>`;
      });
      content += '</div>';
      tabs.push({ title: `Microdata (${microdata.length})`, content });
    }

    return tabs.length > 0 ? tabs : '<p>No structured data found.</p>';
  }

  // Extract data
  const jsonLd = extractJsonLd();
  const openGraph = extractOpenGraph();
  const twitterCard = extractTwitterCard();
  const microdata = extractMicrodata();

  // Generate content
  const content = (BMS.UI.Components && BMS.UI.Components.Panel)
    ? generateEnhancedContent(jsonLd, openGraph, twitterCard, microdata)
    : generateBasicContent(jsonLd, openGraph, twitterCard, microdata);

  // Create panel
  if (BMS.UI.Components && BMS.UI.Components.Panel) {
    const panel = BMS.UI.Components.Panel.create({
      title: '📦 JSON Data Extractor',
      content: content,
      position: { top: 50, left: window.innerWidth - 750 },
      size: { width: 700, height: 650 },
      animation: true,
      theme: 'dark',
      maximizable: true
    });

    if (BMS.UI.Animations) {
      BMS.UI.Animations.scale(panel, { duration: 400, from: 0.9, to: 1 });
    }
  } else {
    BMS.UI.createPanel({
      id: 'json-extract-panel',
      title: '📦 JSON Data Extractor',
      content: content,
      footer: '<button class="bms-button" onclick="document.getElementById(\'json-extract-panel\').remove()">Close</button>'
    });
  }
};

BMS.runJsonExtract();