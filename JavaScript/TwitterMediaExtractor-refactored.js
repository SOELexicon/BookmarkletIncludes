BMS.runTwitterMediaExtractor = async function() {
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
      'data-display/table/table',
      'interactive/animation-effects/animations',
      'templates/data-viewer/data-viewer'
    ]);
  } catch (error) {
    console.error('Failed to load components:', error);
    // Fall back to basic UI if components fail to load
  }

  function isOnTwitter() {
    const hostname = window.location.hostname;
    return hostname.includes('twitter.com') || hostname.includes('x.com');
  }

  function detectMedia() {
    const media = {
      images: [],
      videos: [],
      all: []
    };

    if (!isOnTwitter()) {
      return media;
    }

    const tweetContainers = document.querySelectorAll('article[data-testid="tweet"]');

    tweetContainers.forEach((container, tweetIndex) => {
      // Get tweet author if available
      const authorElement = container.querySelector('[data-testid="User-Name"] a');
      const author = authorElement ? authorElement.textContent : 'Unknown';

      // Get tweet text if available
      const tweetTextElement = container.querySelector('[data-testid="tweetText"]');
      const tweetText = tweetTextElement ? tweetTextElement.textContent.substring(0, 50) : '';

      // Extract images
      container.querySelectorAll('div[data-testid="tweetPhoto"] img[src*="twimg.com/media/"]').forEach((img, imgIndex) => {
        const url = img.src.split('?')[0];
        const largeUrl = url + '?format=jpg&name=large';
        const originalUrl = url + '?format=jpg&name=orig';
        const filename = url.split('/').pop();

        const imageData = {
          id: `img-${tweetIndex}-${imgIndex}`,
          type: 'Image',
          filename: filename,
          url: largeUrl,
          originalUrl: originalUrl,
          thumbnail: url + '?format=jpg&name=small',
          author: author,
          tweet: tweetText,
          tweetIndex: tweetIndex + 1
        };

        media.images.push(imageData);
        media.all.push(imageData);
      });

      // Extract videos
      container.querySelectorAll('div[data-testid="videoPlayer"] video').forEach((video, vidIndex) => {
        const url = video.src;
        const filename = url.split('/').pop().split('?')[0];

        const videoData = {
          id: `vid-${tweetIndex}-${vidIndex}`,
          type: 'Video',
          filename: filename,
          url: url,
          originalUrl: url,
          thumbnail: video.poster || '',
          author: author,
          tweet: tweetText,
          tweetIndex: tweetIndex + 1
        };

        media.videos.push(videoData);
        media.all.push(videoData);
      });
    });

    return media;
  }

  function downloadMedia(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'media';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function copyToClipboard(text) {
    if (BMS.Utils && BMS.Utils.copyToClipboard) {
      BMS.Utils.copyToClipboard(text);
      showNotification('Copied to clipboard!', 'success');
    } else {
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
    if (BMS.UI.Components && BMS.UI.Components.Modal) {
      BMS.UI.Components.Modal.alert({
        title: type === 'success' ? '✅ Success' : 'ℹ️ Info',
        message: message,
        type: type,
        buttonText: 'OK'
      });
    }
  }

  function generateEnhancedContent(media) {
    if (!isOnTwitter()) {
      return createNotOnTwitterContent();
    }

    if (media.all.length === 0) {
      return createNoMediaContent();
    }

    // Use Data Viewer Template if available
    if (BMS.UI.Templates && BMS.UI.Templates.DataViewer) {
      return null; // Will use template directly
    }

    // Fallback to custom enhanced interface
    return createCustomEnhancedContent(media);
  }

  function createNotOnTwitterContent() {
    const container = document.createElement('div');
    container.style.cssText = 'padding: 40px; text-align: center;';
    container.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 16px;">🐦</div>
      <h3 style="color: #667eea; margin-bottom: 8px;">Not on Twitter/X</h3>
      <p style="color: #999;">This bookmarklet only works on twitter.com or x.com</p>
      <p style="margin-top: 16px; font-size: 12px; color: #666;">Please navigate to Twitter/X and try again.</p>
    `;
    return container;
  }

  function createNoMediaContent() {
    const container = document.createElement('div');
    container.style.cssText = 'padding: 40px; text-align: center;';
    container.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 16px;">📷</div>
      <h3 style="color: #667eea; margin-bottom: 8px;">No Media Found</h3>
      <p style="color: #999;">No images or videos detected on this page.</p>
      <p style="margin-top: 16px; font-size: 12px; color: #666;">Scroll down to load more tweets, then try again.</p>
    `;
    return container;
  }

  function createCustomEnhancedContent(media) {
    const container = document.createElement('div');
    container.style.width = '100%';

    // Summary
    const summary = document.createElement('div');
    summary.innerHTML = `
      <div style="padding: 16px; background: rgba(29, 161, 242, 0.1); border-radius: 8px; margin-bottom: 16px; border: 1px solid rgba(29, 161, 242, 0.3);">
        <h3 style="margin: 0 0 12px 0; color: #1da1f2;">📊 Media Summary</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px;">
          <div style="text-align: center; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 6px;">
            <div style="font-size: 24px; font-weight: bold; color: #1da1f2;">${media.all.length}</div>
            <div style="font-size: 12px; color: #999;">Total Media</div>
          </div>
          <div style="text-align: center; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 6px;">
            <div style="font-size: 24px; font-weight: bold; color: #667eea;">${media.images.length}</div>
            <div style="font-size: 12px; color: #999;">Images</div>
          </div>
          <div style="text-align: center; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 6px;">
            <div style="font-size: 24px; font-weight: bold; color: #ff9800;">${media.videos.length}</div>
            <div style="font-size: 12px; color: #999;">Videos</div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(summary);

    // Simple list view
    const listContainer = document.createElement('div');
    listContainer.style.cssText = 'max-height: 400px; overflow-y: auto;';

    media.all.forEach((item, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.style.cssText = 'padding: 12px; margin-bottom: 8px; background: rgba(255,255,255,0.03); border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);';

      const itemContent = document.createElement('div');
      itemContent.style.cssText = 'display: flex; justify-content: space-between; align-items: center;';

      itemContent.innerHTML = `
        <div style="flex: 1;">
          <div style="font-weight: bold; color: ${item.type === 'Image' ? '#667eea' : '#ff9800'}; margin-bottom: 4px;">
            ${item.type === 'Image' ? '🖼️' : '🎬'} ${item.type} #${index + 1}
          </div>
          <div style="font-size: 12px; color: #999;">${item.filename}</div>
          <div style="font-size: 11px; color: #666; margin-top: 2px;">Tweet ${item.tweetIndex} • ${item.author}</div>
        </div>
      `;

      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = 'display: flex; gap: 8px;';

      const openBtn = document.createElement('button');
      openBtn.textContent = 'Open';
      openBtn.style.cssText = 'padding: 6px 12px; background: rgba(102,126,234,0.2); border: 1px solid rgba(102,126,234,0.4); border-radius: 4px; color: #667eea; cursor: pointer; font-size: 12px;';
      openBtn.onclick = () => window.open(item.originalUrl, '_blank');

      const downloadBtn = document.createElement('button');
      downloadBtn.textContent = 'Download';
      downloadBtn.style.cssText = 'padding: 6px 12px; background: rgba(0,200,81,0.2); border: 1px solid rgba(0,200,81,0.4); border-radius: 4px; color: #00c851; cursor: pointer; font-size: 12px;';
      downloadBtn.onclick = () => downloadMedia(item.originalUrl, item.filename);

      buttonContainer.appendChild(openBtn);
      buttonContainer.appendChild(downloadBtn);
      itemContent.appendChild(buttonContainer);
      itemDiv.appendChild(itemContent);

      listContainer.appendChild(itemDiv);
    });

    container.appendChild(listContainer);

    return container;
  }

  function generateBasicContent(media) {
    if (!isOnTwitter()) {
      return '<p style="padding: 20px; text-align: center;">This bookmarklet only works on twitter.com or x.com.</p>';
    }

    if (media.all.length === 0) {
      return '<p style="padding: 20px; text-align: center;">No media found on this page.</p>';
    }

    const tabs = [];

    if (media.images.length > 0) {
      let imageContent = '<ul>';
      media.images.forEach(img => {
        imageContent += `<li><a href="${img.originalUrl}" target="_blank">${img.filename}</a></li>`;
      });
      imageContent += '</ul>';
      tabs.push({ title: `Images (${media.images.length})`, content: imageContent });
    }

    if (media.videos.length > 0) {
      let videoContent = '<ul>';
      media.videos.forEach(video => {
        videoContent += `<li><a href="${video.url}" target="_blank">${video.filename}</a></li>`;
      });
      videoContent += '</ul>';
      tabs.push({ title: `Videos (${media.videos.length})`, content: videoContent });
    }

    return tabs;
  }

  // Detect media
  const media = detectMedia();

  // Create interface using Data Viewer Template if available
  if (BMS.UI.Templates && BMS.UI.Templates.DataViewer && media.all.length > 0) {
    const viewer = BMS.UI.Templates.DataViewer.create({
      title: '🐦 Twitter Media Extractor',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>',
      position: { top: 50, left: window.innerWidth - 950 },
      size: { width: 900, height: 700 },
      columns: [
        {
          key: 'type',
          title: 'Type',
          sortable: true,
          width: '80px',
          renderer: (value) => {
            const icon = value === 'Image' ? '🖼️' : '🎬';
            const color = value === 'Image' ? '#667eea' : '#ff9800';
            return `<span style="color: ${color};">${icon} ${value}</span>`;
          }
        },
        {
          key: 'filename',
          title: 'Filename',
          sortable: true
        },
        {
          key: 'author',
          title: 'Author',
          sortable: true,
          width: '150px'
        },
        {
          key: 'tweetIndex',
          title: 'Tweet #',
          sortable: true,
          width: '80px',
          align: 'center'
        },
        {
          key: 'url',
          title: 'Actions',
          width: '180px',
          renderer: (value, row) => {
            const container = document.createElement('div');
            container.style.cssText = 'display: flex; gap: 4px;';

            const openBtn = document.createElement('button');
            openBtn.textContent = 'Open';
            openBtn.style.cssText = 'flex: 1; padding: 4px 8px; background: rgba(102,126,234,0.2); border: 1px solid rgba(102,126,234,0.4); border-radius: 4px; color: #667eea; cursor: pointer; font-size: 11px;';
            openBtn.onclick = () => window.open(row.originalUrl, '_blank');

            const downloadBtn = document.createElement('button');
            downloadBtn.textContent = 'Download';
            downloadBtn.style.cssText = 'flex: 1; padding: 4px 8px; background: rgba(0,200,81,0.2); border: 1px solid rgba(0,200,81,0.4); border-radius: 4px; color: #00c851; cursor: pointer; font-size: 11px;';
            downloadBtn.onclick = () => downloadMedia(row.originalUrl, row.filename);

            const copyBtn = document.createElement('button');
            copyBtn.textContent = '📋';
            copyBtn.style.cssText = 'padding: 4px 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: #e0e0e0; cursor: pointer; font-size: 11px;';
            copyBtn.onclick = () => copyToClipboard(row.originalUrl);

            container.appendChild(openBtn);
            container.appendChild(downloadBtn);
            container.appendChild(copyBtn);

            return container;
          }
        }
      ],
      data: media.all,
      features: {
        search: true,
        export: true,
        filters: true,
        sort: true,
        pagination: true,
        selection: true,
        columnResize: true,
        refresh: true,
        fullscreen: true
      },
      quickActions: [
        {
          label: 'Download All',
          icon: '💾',
          type: 'primary',
          tooltip: 'Download all media files',
          onClick: () => {
            media.all.forEach((item, index) => {
              setTimeout(() => {
                downloadMedia(item.originalUrl, item.filename);
              }, index * 500); // Stagger downloads
            });
            showNotification(`Downloading ${media.all.length} files...`, 'info');
          }
        },
        {
          label: 'Copy All URLs',
          icon: '📋',
          type: 'default',
          tooltip: 'Copy all media URLs to clipboard',
          onClick: () => {
            const urls = media.all.map(item => item.originalUrl).join('\n');
            copyToClipboard(urls);
          }
        }
      ],
      onRefresh: async () => {
        // Re-detect media
        const newMedia = detectMedia();
        return newMedia.all;
      },
      onExport: (table) => {
        if (BMS.UI.Components && BMS.UI.Components.Table) {
          BMS.UI.Components.Table.exportData(table, 'csv');
        }
      }
    });

    // Add slide animation
    if (BMS.UI.Animations) {
      BMS.UI.Animations.slide(viewer.panel, 'left', {
        duration: 400,
        distance: 30
      });
    }

  } else if (BMS.UI.Components && BMS.UI.Components.Panel) {
    // Use enhanced panel
    const content = generateEnhancedContent(media);

    const panel = BMS.UI.Components.Panel.create({
      title: '🐦 Twitter Media Extractor',
      content: content,
      position: { top: 50, left: window.innerWidth - 750 },
      size: { width: 700, height: 600 },
      animation: true,
      theme: 'dark',
      maximizable: true
    });

    if (BMS.UI.Animations) {
      BMS.UI.Animations.scale(panel, { duration: 400, from: 0.9, to: 1 });
    }
  } else {
    // Fallback to basic panel
    const content = generateBasicContent(media);

    BMS.UI.createPanel({
      id: 'twitter-media-extractor-panel',
      title: '🐦 Twitter Media Extractor',
      content: content,
      footer: '<button class="bms-button" onclick="document.getElementById(\'twitter-media-extractor-panel\').remove()">Close</button>'
    });
  }
};

BMS.runTwitterMediaExtractor();