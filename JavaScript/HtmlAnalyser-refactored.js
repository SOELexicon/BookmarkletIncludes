(function() {

  // Ensure the BMS suite is loaded
  if (!window.BMS) {
    alert("Bookmarklet Suite not found!");
    return;
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

    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || document.querySelector('[data-reactroot], [data-reactid], [data-react-helmet]')) {
      frameworks.push('React');
    }
    if (window.ng || document.querySelector('[ng-app], [ng-controller], [ng-model]') || document.querySelector('*[class*="ng-"]')) {
      frameworks.push('Angular');
    }
    if (window.__VUE__ || document.querySelector('[v-app], [v-bind], [v-model], [v-if]') || document.querySelector('*[class*="v-"]')) {
      frameworks.push('Vue');
    }
    if (document.querySelector('[class*="svelte-"]')) {
      frameworks.push('Svelte');
    }
    if (window.jQuery || window.$) {
      frameworks.push(`jQuery (${window.jQuery ? window.jQuery.fn.jquery : 'Unknown'})`);
    }
    if (document.querySelector('.container, .row, .col, .navbar, .btn-primary')) {
      frameworks.push('Bootstrap');
    }
    const hasTailwind = Array.from(document.querySelectorAll('*')).some(e => {
      const classes = getClassName(e).split(' ');
      return classes.length > 3 && classes.some(c => /^(bg-|text-|p-|m-|flex|grid|border-|rounded-|shadow-|hover:)/.test(c));
    });
    if (hasTailwind) {
      frameworks.push('Tailwind CSS');
    }
    if (document.querySelector('.MuiButton-root, .MuiAppBar-root, .MuiTextField-root')) {
      frameworks.push('Material UI');
    }
    if (document.querySelector('.ant-btn, .ant-table, .ant-form')) {
      frameworks.push('Ant Design');
    }
    if (document.querySelector('[class^="chakra-"]')) {
      frameworks.push('Chakra UI');
    }

    return frameworks;
  }

  function generateContent() {
    const frameworks = detectFrameworks();
    if (frameworks.length === 0) {
      return '<p>No frameworks detected.</p>';
    }

    let content = '<ul>';
    for (const framework of frameworks) {
      content += `<li>${framework}</li>`;
    }
    content += '</ul>';
    return content;
  }

  // Create the panel using the BMS suite
  BMS.UI.createPanel({
    id: 'html-analyser-panel',
    title: 'HTML Analyser',
    content: generateContent(),
    footer: '<button class="bms-button" onclick="document.getElementById(\'html-analyser-panel\').remove()">Close</button>'
  });

})();
