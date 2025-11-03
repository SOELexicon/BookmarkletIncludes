(function() {

  // Ensure the BMS suite is loaded
  if (!window.BMS) {
    alert("Bookmarklet Suite not found!");
    return;
  }

  function isOnTwitter() {
    const hostname = window.location.hostname;
    return hostname.includes('twitter.com') || hostname.includes('x.com');
  }

  function detectMedia() {
    const media = {
      images: [],
      videos: []
    };

    if (!isOnTwitter()) {
      return media;
    }

    const tweetContainers = document.querySelectorAll('article[data-testid="tweet"]');

    tweetContainers.forEach(container => {
      // Extract images
      container.querySelectorAll('div[data-testid="tweetPhoto"] img[src*="twimg.com/media/"]').forEach(img => {
        media.images.push(img.src.split('?')[0] + '?format=jpg&name=large');
      });

      // Extract videos
      container.querySelectorAll('div[data-testid="videoPlayer"] video').forEach(video => {
        media.videos.push(video.src);
      });
    });

    // Remove duplicates
    media.images = [...new Set(media.images)];
    media.videos = [...new Set(media.videos)];

    return media;
  }

  function generateContent() {
    if (!isOnTwitter()) {
        return '<p>This bookmarklet only works on twitter.com or x.com.</p>';
    }

    const media = detectMedia();

    if (media.images.length === 0 && media.videos.length === 0) {
      return '<p>No media found on this page.</p>';
    }

    const tabs = [];

    if (media.images.length > 0) {
      let imageContent = '<ul>';
      media.images.forEach(img => {
        imageContent += `<li><a href="${img}" target="_blank">${img.split('/').pop().split('?')[0]}</a></li>`;
      });
      imageContent += '</ul>';
      tabs.push({ title: `Images (${media.images.length})`, content: imageContent });
    }

    if (media.videos.length > 0) {
      let videoContent = '<ul>';
      media.videos.forEach(video => {
        videoContent += `<li><a href="${video}" target="_blank">${video.split('/').pop().split('?')[0]}</a></li>`;
      });
      videoContent += '</ul>';
      tabs.push({ title: `Videos (${media.videos.length})`, content: videoContent });
    }

    return tabs;
  }

  // Create the panel using the BMS suite
  BMS.UI.createPanel({
    id: 'twitter-media-extractor-panel',
    title: 'Twitter Media Extractor',
    content: generateContent(),
    footer: '<button class="bms-button" onclick="document.getElementById(\'twitter-media-extractor-panel\').remove()">Close</button>'
  });

})();
