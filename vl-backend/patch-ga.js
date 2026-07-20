const fs = require('fs');
const path = require('path');

const newSnippet = `<script id="vl-analytics-bridge">
  window.gtag = function() {
    if (window.parent) {
      window.parent.postMessage({
        type: 'GA_EVENT',
        action: arguments[1] || 'unknown_event',
        params: arguments[2] || {}
      }, '*');
    }
  };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push = function() {
    var args = arguments[0];
    if (args && args[0] === 'event') {
      if (window.parent) {
        window.parent.postMessage({
          type: 'GA_EVENT',
          action: args[1] || 'unknown_event',
          params: args[2] || {}
        }, '*');
      }
    }
  };
</script>`;

const exps = fs.readdirSync('./uploads/experiments');
exps.forEach(exp => {
  const idxPath = path.join('./uploads/experiments', exp, 'simulation/index.html');
  if(fs.existsSync(idxPath)) {
    let content = fs.readFileSync(idxPath, 'utf8');
    
    // Remove old patch if it exists
    const oldSnippetRegex = /<script>\s*window\.addEventListener\('message', function\(event\) \{\s*if \(event\.data && event\.data\.type === 'INIT_GA'\)[\s\S]*?<\/script>/;
    content = content.replace(oldSnippetRegex, '');
    
    // Remove new snippet if it exists so we don't double inject
    const newSnippetRegex = /<script id="vl-analytics-bridge">[\s\S]*?<\/script>/;
    content = content.replace(newSnippetRegex, '');

    // Inject new bridge snippet
    content = content.replace('</head>', newSnippet + '\n  </head>');
    
    fs.writeFileSync(idxPath, content);
    console.log('Patched existing simulation with bridge:', exp);
  }
});
