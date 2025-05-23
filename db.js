const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'shwetha@05',
    database: 'foodigo_db'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database: foodigo_db');
});

module.exports = db; 