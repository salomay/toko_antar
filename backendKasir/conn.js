var mysql = require('mysql');
require('dotenv').config()

var con = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT
  // insecureAuth : true
});

con.connect(function (err){
    if(err) throw err;
});

module.exports = con;