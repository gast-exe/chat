const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const dbWrapper = require('sqlite');
const dbFile = './chat.db';
const exists = fs.existsSync(dbFile);
let db;

dbWrapper.open({
   filename: dbFile,
   driver: sqlite3.Database,
}).then(async item => {
   db = item;
   try {
      if (!exists) {
         await db.run(`
            CREATE TABLE user (
               user_id INTEGER PRIMARY KEY AUTOINCREMENT,
               login TEXT,
               password TEXT
            );`
         );
         await db.run(`
            INSERT INTO user (login, password) VALUES
               ('admin', 'admin'),
               ('user','qwerty')
            ;`
         );
         await db.run(`
            CREATE TABLE message (
               msg_id INTEGER PRIMARY KEY AUTOINCREMENT,
               content TEXT,
               author_id INTEGER,
               FOREIGN KEY(author_id) REFERENCES user(id)
            );`
         );
      } else {
         console.log(await db.all('SELECT * FROM user'));
      }
   } catch (err) {
      console.log(err);
   }
});

module.exports = {
   getMessages: async () => {
      try {
         return await db.all(`
            SELECT msg_id, content, user_id, login FROM message
            JOIN user ON message.author_id = user.user_id
         `);
      } catch (err) {
         console.log(err);
      }
   },
   addMessage: async (user_id, msg) => {
      try {
         await db.run(`
         INSERT INTO message (content, author_id) VALUES ('${msg}','${user_id}')
      `);
      } catch (err) {
         console.log(err);
      }
   },
   isUserExist: async login => {
      try {
         const user = await db.all(`SELECT * FROM user WHERE login = '${login}'`);
         return user.length;
      } catch (err) {
         console.log(err);
      }
   },
   addUser: async user => {
      try {
         await db.run('INSERT INTO user(login, password) VALUES (?, ?)', [user.login, user.password]);
      } catch (err) {
         console.log(err);
      }
   }
};