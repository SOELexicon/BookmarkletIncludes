(function() {

  // Ensure the BMS suite is loaded
  if (!window.BMS) {
    alert("Bookmarklet Suite not found!");
    return;
  }

  function findJsonLdScripts() {
    return document.querySelectorAll('script[type="application/ld+json"]');
  }

  function generateContent() {
    const scripts = findJsonLdScripts();
    if (scripts.length === 0) {
      return '<p>No JSON-LD scripts found on this page.</p>';
    }

    const tabs = [];
    scripts.forEach((script, index) => {
      try {
        const json = JSON.parse(script.textContent);
        const prettyJson = JSON.stringify(json, null, 2);
        const textareaId = `bms-json-textarea-${index}`;
        const content = `
          <div>
            <textarea id="${textareaId}" style="width: 100%; height: 200px;" readonly>${prettyJson}</textarea>
            <button class="bms-button bms-copy-btn" data-textarea-id="${textareaId}">Copy</button>
          </div>
        `;
        tabs.push({ title: `#${index + 1}`, content: content });
      } catch (e) {
        tabs.push({ title: `#${index + 1} (Error)`, content: `<p>Error parsing JSON-LD: ${e.message}</p>` });
      }
    });

    return tabs;
  }

  function addCopyButtonListeners() {
      const copyButtons = document.querySelectorAll('.bms-copy-btn');
      copyButtons.forEach(btn => {
          btn.onclick = () => {
              const textareaId = btn.getAttribute('data-textarea-id');
              const textarea = document.getElementById(textareaId);
              BMS.Utils.copyToClipboard(textarea.value);
          };
      });
  }

  // Create the panel using the BMS suite
  BMS.UI.createPanel({
    id: 'json-extract-panel',
    title: 'JSON-LD Extractor',
    content: generateContent(),
    footer: '<button class="bms-button" onclick="document.getElementById(\'json-extract-panel\').remove()">Close</button>'
  });

  addCopyButtonListeners();

})();
