const fs = require('fs');
const path = require('path');
const snippet = `<script>
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
      gtag('config', measurementId, { debug_mode: true });
    }
  });
</script>`;

const exps = fs.readdirSync('./uploads/experiments');
exps.forEach(exp => {
  const idxPath = path.join('./uploads/experiments', exp, 'simulation/index.html');
  if(fs.existsSync(idxPath)) {
    let content = fs.readFileSync(idxPath, 'utf8');
    if(!content.includes('INIT_GA')) {
      content = content.replace('</head>', snippet + '\n  </head>');
      fs.writeFileSync(idxPath, content);
      console.log('Patched existing simulation:', exp);
    }
  }
});
