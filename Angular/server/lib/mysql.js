'use strict';

var Promise = require('bluebird'),
  getConnection = require('./db'),
  mysql = {};

mysql.query = (query, data) => {
  return Promise.using(getConnection(), (conn) => {
    return conn.queryAsync(query, data);
  });
};

module.exports = mysql;
