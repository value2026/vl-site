const fs = require('fs');
const path = require('path');
const oldSnippet = `<script>
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'INIT_GA') {
      var measurementId = event.data.measurementId;
      if (window.gaInitialized) return;
      window.gaInitialized = true;
      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
      document.head.appendChild(script);
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', measurementId, { 
        debug_mode: true,
        user_id: event.data.userId,
        experiment_id: event.data.experimentId
      });
    }
  });
</script>`;

const exps = fs.readdirSync('./uploads/experiments');
exps.forEach(exp => {
  const idxPath = path.join('./uploads/experiments', exp, 'simulation/index.html');
  if(fs.existsSync(idxPath)) {
    let content = fs.readFileSync(idxPath, 'utf8');
    const targetRegex = /<script>\s*window\.addEventListener\('message', function\(event\) \{\s*if \(event\.data && event\.data\.type === 'INIT_GA'\)[\s\S]*?<\/script>/;
    if (content.match(targetRegex)) {
      content = content.replace(targetRegex, oldSnippet);
      fs.writeFileSync(idxPath, content);
      console.log('Reverted ' + exp);
    }
  }
});
