javascript:(function(){
  const SUITE_URL = 'https://raw.githubusercontent.com/SOELexicon/BookmarkletIncludes/refs/heads/main/JavaScript/bookmarklet-suite.js';
  const SCRIPT_URL = 'https://raw.githubusercontent.com/SOELexicon/BookmarkletIncludes/refs/heads/main/JavaScript/JsonExtract-refactored.js';

  if (window.BMS) {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    document.body.appendChild(script);
    return;
  }

  const suiteScript = document.createElement('script');
  suiteScript.src = SUITE_URL;
  suiteScript.onload = () => {
    BMS.init();
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    document.body.appendChild(script);
  };
  document.body.appendChild(suiteScript);
})();