// This file is for testing the Bookmarklet Suite.
// It simulates the loading of the suite and the creation of a UI panel.
//
// NOTE: This test file will NOT work on GitHub.com due to strict Content Security Policy (CSP).
// Test on regular websites like: news sites, Twitter/X, Wikipedia, etc.

(async function(){
  const scriptUrl = 'https://raw.githubusercontent.com/SOELexicon/BookmarkletIncludes/refs/heads/main/JavaScript/bookmarklet-suite.js';

  // Avoid re-injecting the script
  if (window.BMS) {
    BMS.UI.createPanel({
      id: 'bms-test-panel',
      title: 'BMS Test Panel',
      content: '<p>Bookmarklet Suite is already loaded!</p><p>This is a new panel.</p>',
      footer: '<button class="bms-button bms-button-primary">OK</button>'
    });
    return;
  }

  try {
    // Fetch and load via Blob URL to bypass some CSP restrictions
    const suiteCode = await fetch(scriptUrl).then(r => r.text());
    const blob = new Blob([suiteCode], {type: 'text/javascript'});
    const blobUrl = URL.createObjectURL(blob);
    await import(blobUrl);
    URL.revokeObjectURL(blobUrl);

    BMS.init();
    BMS.UI.createPanel({
      id: 'bms-test-panel',
      title: 'BMS Test Panel',
      content: [
        {
          title: 'Home',
          content: '<p>Welcome to the BMS Test Panel!</p><p>This panel demonstrates the tabbed interface.</p>'
        },
        {
          title: 'UI Tests',
          content: '<button id="bms-show-modal-btn" class="bms-button">Show Modal</button> <button id="bms-show-spinner-btn" class="bms-button">Show Spinner</button>'
        },
        {
          title: 'Status Tests',
          content: '<button id="bms-show-status-btn" class="bms-button">Show Status Messages</button>'
        },
        {
          title: 'Utils Tests',
          content: '
            <h4>Throttle</h4>
            <button id="bms-throttle-btn" class="bms-button">Click me (throttled)</button>
            <p>Counter: <span id="bms-throttle-counter">0</span></p>
            <hr>
            <h4>Debounce</h4>
            <input type="text" id="bms-debounce-input" placeholder="Type here (debounced)">
            <p>Input value: <span id="bms-debounce-output"></span></p>
            <hr>
            <h4>Parse Engagement Count</h4>
            <input type="text" id="bms-parse-input" placeholder="e.g., 1.5K">
            <button id="bms-parse-btn" class="bms-button">Parse</button>
            <p>Result: <span id="bms-parse-output"></span></p>
          '
        }
      ],
      footer: '<button class="bms-button bms-button-primary">OK</button>&nbsp;<button class="bms-button">Cancel</button>'
    });

    document.getElementById('bms-show-modal-btn').onclick = () => {
      BMS.UI.createModal({
        id: 'bms-test-modal',
        title: 'Test Modal',
        content: '<p>This is a modal dialog created by the Bookmarklet Suite.</p><p>Click the close button or outside the modal to dismiss it.</p>'
      });
    };

    document.getElementById('bms-show-spinner-btn').onclick = () => {
      BMS.UI.showSpinner();
      setTimeout(() => {
        BMS.UI.hideSpinner();
      }, 2000);
    };

    document.getElementById('bms-show-status-btn').onclick = () => {
      BMS.UI.updateStatus('This is an info message.', 'info');
      setTimeout(() => BMS.UI.updateStatus('This is a success message.', 'success'), 1000);
      setTimeout(() => BMS.UI.updateStatus('This is a warning message.', 'warning'), 2000);
      setTimeout(() => BMS.UI.updateStatus('This is an error message.', 'error'), 3000);
    };

    // Utils Tests
    const throttleCounter = document.getElementById('bms-throttle-counter');
    let throttleCount = 0;
    document.getElementById('bms-throttle-btn').addEventListener('click', BMS.Utils.throttle(() => {
      throttleCount++;
      throttleCounter.textContent = throttleCount;
    }, 1000));

    const debounceOutput = document.getElementById('bms-debounce-output');
    document.getElementById('bms-debounce-input').addEventListener('input', BMS.Utils.debounce((e) => {
      debounceOutput.textContent = e.target.value;
    }, 500));

    const parseOutput = document.getElementById('bms-parse-output');
    document.getElementById('bms-parse-btn').onclick = () => {
      const inputText = document.getElementById('bms-parse-input').value;
      parseOutput.textContent = BMS.Utils.parseEngagementCount(inputText);
    };
  } catch(e) {
    alert('Failed to load Bookmarklet Suite: ' + e.message + '\n\nThis may be due to Content Security Policy restrictions. Try testing on a different website (not GitHub.com).');
  }

})();
