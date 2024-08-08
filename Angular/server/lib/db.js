'use strict';

const mysql = require('mysql');
const config = require('../../config.json');
const _ = require('lodash');
const Promise = require('bluebird');
Promise.promisifyAll(require('mysql/lib/Connection').prototype);
Promise.promisifyAll(require('mysql/lib/Pool').prototype);

const pool = mysql.createPool({
  host: _.get(config, 'database.hostname'),
  user: _.get(config, 'database.username'),
  password: _.get(config, 'database.password'),
  database: _.get(config, 'database.database'),
  connectionLimit: 50,
  supportBigNumbers: true
});

function getSqlConnection() {
  return pool.getConnectionAsync().disposer(function(connection) {
    connection.release();
  });
}

module.exports = getSqlConnection;
