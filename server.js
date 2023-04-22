const path = require('path');
const http = require('http');
const fs = require('fs');
const db = require('./database');
const { Server } = require('socket.io');
const cookie = require('cookie');

const validateAuthToken = [];
const readStaticFile = fileName => fs.readFileSync(path.join(__dirname, 'static', fileName), 'utf8');

const index = readStaticFile('index.html'),
   style = readStaticFile('style.css'),
   script = readStaticFile('script.js'),
   register = readStaticFile('register.html'),
   login = readStaticFile('login.html'),
   auth = readStaticFile('auth.js');

const server = http.createServer((request, response) => {
   if (request.method == 'GET') {
      switch (request.url) {
         case '/style.css': return response.end(style);
         case '/register': return response.end(register);
         case '/login': return response.end(login);
         case '/auth.js': return response.end(auth);
         default: return guarded(request, response);
      }
   }
   if (request.method == 'POST') {
      switch (request.url) {
         case '/api/register': return registerUser(request, response);
         case '/api/login': return loginUser(request, response);
         default: return guarded(request, response);
      }
   }
   response.statusCode = 404;
   return response.end('Error 404');
});

server.listen(3000);

const io = new Server(server);

io.use((socket, next) => {
   const cookie = socket.handshake.auth.cookie;
   const credentials = getCredentials(cookie);

   if (!credentials) {
      next(new Error('no auth'));
   }
   socket.credentials = credentials;
   next();
});

io.on('connection', async socket => {
   console.log('a user connected. Id: ' + socket.id);
   const nickname = socket.credentials?.username ?? null;
   const userId = socket.credentials?.user_id ?? null;

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
   request.on('end', async () => {
      try {
         const user = JSON.parse(data);
         const token = await db.getAuthToken(user);
         validateAuthToken.push(token);
         response.writeHead(200);
         response.end(token);
      } catch (err) {
         response.writeHead(403);
         response.end(err);
      }
   });
}
function getCredentials(cook) {
   const cookies = cookie.parse(cook);
   const token = cookies?.token;

   if (!token || !validateAuthToken.includes(token)) return null;

   const [user_id, login] = token.split('.');

   if (!user_id || !login) return null;
   return { user_id: user_id, username: login };
}
function guarded(request, response) {
   const credentials = getCredentials(request.headers?.cookie);
   if (!credentials) {
      response.writeHead(302, { 'Location': '/register.html' });
   }
   if (request.method == 'GET') {
      console.log(request.url);
      switch (request.url) {
         case '/': return response.end(index);
         case '/script.js': return response.end(script);
      }
   }
}