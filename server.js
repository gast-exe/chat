const path = require('path');
const http = require('http');
const fs = require('fs');
const db = require('./database');
const { Server } = require('socket.io');

const readStaticFile = fileName => fs.readFileSync(path.join(__dirname, 'static', fileName), 'utf8');

const index = readStaticFile('index.html'),
   style = readStaticFile('style.css'),
   script = readStaticFile('script.js'),
   register = readStaticFile('register.html'),
   login = readStaticFile('login.html'),
   auth = readStaticFile('auth.js');

const server = http.createServer((request, response) => {
   switch (request.url) {
      case '/': return response.end(index);
      case '/style.css': return response.end(style);
      case '/script.js': return response.end(script);
      case '/register.html': return response.end(register);
      case '/login.html': return response.end(login);
      case '/auth.js': return response.end(auth);
   }
   if (request.method == 'POST') {
      switch (request.url) {
         case '/api/register': return registerUser(request, response);
         case '/api/login': return loginUser(request, response);
      }
   }
   response.statusCode = 404;
   return response.end('Error 404');
});

server.listen(3000);

const io = new Server(server);

io.on('connection', async socket => {
   console.log('a user connected. Id: ' + socket.id);
   let nickname = 'admin';
   const message = await db.getMessages();
   socket.emit('all_messages', message);

   socket.on('new_message', message => {
      db.addMessage(1, message);
      io.emit('message', `${nickname}: ${message}`);
   });
});

function registerUser(request, response) {
   let data = '';
   request.on('data', chunk => data += chunk);
   request.on('end', async () => {
      try {
         const user = JSON.parse(data);
         if (!user.login || !user.password) {
            return response.end('Empty login or password');
         }
         if (await db.isUserExist(user.login)) {
            return response.end('User already exists');
         }
         await db.addUser(user);
         response.end('Registers is successful');
      } catch (err) {
         console.log(err);
      }
   });
}
function loginUser(request, response) {
   let data = '';
   request.on('data', chunk => data += chunk);
   request.on('end', () => {
      try {
         const user = JSON.parse(data);

         response.end();
      } catch (err) {
         console.log(err);
      }
   });
}