const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const dbWrapper = require('sqlite');
const crypto = require('crypto');

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
               password TEXT,
               salt TEXT
            );`
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
      const salt = crypto.randomBytes(16).toString('hex');
      const password = crypto.pbkdf2Sync(user.password, salt, 1000, 64, 'sha512').toString('hex');
      try {
         await db.run('INSERT INTO user(login, password, salt) VALUES (?, ?, ?)', [user.login, password, salt]);
      } catch (err) {
         console.log(err);
      }
   },
   getAuthToken: async user => {
      const candidate = await db.all(`SELECT * FROM user WHERE login = '${user.login}'`);

      if (!candidate.length) {
         throw 'Wrong login';
      }
      const { user_id, login, password, salt } = candidate[0];
      const hash = crypto.pbkdf2Sync(user.password, salt, 1000, 64, 'sha512').toString('hex');
      
      if (password !== hash) {
         throw 'Wrong password';
      }
      return `${user_id}.${login}.${crypto.randomBytes(20).toString('hex')}`;
   }
};