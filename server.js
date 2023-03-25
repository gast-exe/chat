const path = require('path');
const http = require('http');
const fs = require('fs');

const index = fs.readFileSync(path.join(__dirname, 'static', 'index.html'), 'utf8');

const server = http.createServer((request, response) => {
   switch (request.url) {
      case '/': return response.end(index);
   }
   response.statusCode = 404;
   return response.end('Error 404');
});

server.listen(3000);