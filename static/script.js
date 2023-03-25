const socket = io();
const messages = document.getElementById('messages');
const form = document.createElement('form');
const input = document.createElement('input');

form.addEventListener('submit', event => {
   event.preventDefault();
   if(input.value){
      socket.emit('new_message',input.value);
      input.value = '';
   }
});