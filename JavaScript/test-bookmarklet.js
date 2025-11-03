// This file is for testing the Bookmarklet Suite.
// It simulates the loading of the suite and the creation of a UI panel.

(function(){
  // Since we are in the same directory, we can just load the script.
  // In a real bookmarklet, this would be a full URL to the hosted script.
  const scriptUrl = 'bookmarklet-suite.js';

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

  const script = document.createElement('script');
  script.src = scriptUrl;
  script.onload = () => {
    BMS.init();
    BMS.UI.createPanel({
      id: 'bms-test-panel',
      title: 'BMS Test Panel',
      content: '<p>The Bookmarklet Suite has been loaded and initialized.</p><p>This panel is a demonstration of the UI capabilities.</p><button id="bms-show-modal-btn" class="bms-button">Show Modal</button> <button id="bms-show-spinner-btn" class="bms-button">Show Spinner</button> <button id="bms-show-status-btn" class="bms-button">Show Status</button>',
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
  };
  document.head.appendChild(script);

})();
