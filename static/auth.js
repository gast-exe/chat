const registerForm = document.getElementById('register-form');

registerForm?.addEventListener('submit', event => {
   event.preventDefault();
   const { login, password, passwordRepeat } = registerForm;

   if (password.value !== passwordRepeat.value) {
      return alert('Passwords do not match');
   }

   const user = JSON.stringify({
      login: login.value,
      password: password.value
   });

   const xhr = new XMLHttpRequest();
   xhr.open('POST', 'api/register');
   xhr.send(user);
   xhr.onload = () => {
      alert(xhr.response);
      if (xhr.response == 'Registers is successful') {
         window.open('/login', '_self');
      }
   };
});


const loginForm = document.getElementById('login-form');

loginForm?.addEventListener('submit', event => {
   event.preventDefault();
   const { login, password } = loginForm;

   const user = JSON.stringify({
      login: login.value,
      password: password.value
   });

   const xhr = new XMLHttpRequest();
   xhr.open('POST', '/api/login');
   xhr.send(user);
   xhr.onload = () => {
      const token = xhr.response;
      if (xhr.status == 200) {
         document.cookie = `token="${token};expires=${new Date(new Date().getTime() + 3600000)}"`;
         window.location.assign('/');
      } else {
         return alert(token);
      }
   };
});