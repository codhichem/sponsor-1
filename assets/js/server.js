const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  let filePath = '.' + req.url;
  
  // Redirection par défaut vers votre fichier principal
  if (filePath === './' || filePath === './index.html') {
    filePath = './Sponsoring Manager PRO (12).html';
  }

  // Décoder l'URL pour les espaces
  filePath = decodeURIComponent(filePath);

  const extname = path.extname(filePath);
  let contentType = 'text/html';
  switch (extname) {
    case '.js': contentType = 'text/javascript'; break;
    case '.css': contentType = 'text/css'; break;
    case '.json': contentType = 'application/json'; break;
    case '.png': contentType = 'image/png'; break;
    case '.jpg': contentType = 'image/jpg'; break;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if(error.code == 'ENOENT'){
        res.writeHead(404);
        res.end('Fichier non trouvé : ' + filePath);
      } else {
        res.writeHead(500);
        res.end('Erreur serveur : ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

const port = 8081;
server.listen(port, () => {
  console.log(`🚀 SERVEUR CRM RÉEL DÉMARRÉ`);
  console.log(`👉 Accédez à votre site : http://localhost:${port}/`);
});
