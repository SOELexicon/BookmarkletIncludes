javascript:(function(){
  const SUITE_URL = '../JavaScript/bookmarklet-suite.js';
  const SCRIPT_URL = '../JavaScript/HtmlAnalyser-refactored.js';

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