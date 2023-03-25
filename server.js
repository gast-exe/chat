const path = require('path');
const http = require('http');
const fs = require('fs');
const { Server } = require('socket.io');

const readStaticFile = fileName => fs.readFileSync(path.join(__dirname, 'static', fileName), 'utf8');

const index = readStaticFile('index.html'),
   style = readStaticFile('style.css'),
   script = readStaticFile('script.js');

const server = http.createServer((request, response) => {
   switch (request.url) {
      case '/': return response.end(index);
      case '/style.css': return response.end(style);
      case '/script.js': return response.end(script);
   }
   response.statusCode = 404;
   return response.end('Error 404');
});

server.listen(3000);

const io = new Server(server);

io.on('connection', socket => {
   console.log('a user connected. Id: ' + socket.id);
   socket.on('new_message', message => console.log(message));
}); 