const messages = document.getElementById('messages');
const input = document.getElementById('input');
const logout = document.getElementById('logout');
const socket = io({
   auth: {
      cookie: document.cookie
   }
});

document.getElementById('form').addEventListener('submit', event => {
   event.preventDefault();
   if (input.value) {
      socket.emit('new_message', input.value);
      input.value = '';
   }
});
logout.addEventListener('click', event => {
   document.cookie = "token=;max-age=0";
   location.reload();
});

socket.on('message', msg => {
   const item = document.createElement('li');
   item.textContent = msg;
   messages.appendChild(item);
   window.scrollTo(0, document.body.scrollHeight);
});
socket.on('all_messages', msgArray => {
   for (const msg of msgArray) {
      const item = document.createElement('li');
      item.textContent = msg.login + ': ' + msg.content;
      messages.appendChild(item);
   }
   window.scrollTo(0, document.body.scrollHeight);
});