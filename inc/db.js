const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'saboroso',
  password: '123456',
  multipleStatements: true// multiplas query's para o bd
});

module.exports = connection;
