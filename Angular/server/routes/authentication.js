'use strict';

const _ = require('lodash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const config = require('../../config.json');
const mysql = require('../lib/mysql');
const authentication = {};

// Authenticate login
authentication.authenticate = (req, res) => {
  const user = _.get(req, 'body.username');
  let sql = 'SELECT * FROM `users` WHERE `username` = ?';

  return mysql.query(sql, [user])
    .then(userData => {
      if (!_.isEmpty(userData)) {
        const pass = _.get(req, 'body.password');
        const hash = crypto.createHmac('sha256', userData[0].salt);
        hash.update(pass);
        const value = hash.digest('hex');

        if (!_.isEqual(userData[0].password, value)) {
          return res.sendInvalidUsernameOrPassword();
        }
      }

      if (!_.isUndefined(userData[0])) {
        res.sendData({
          name: userData[0].name,
          token: jwt.sign({user: { id: userData[0].id, username: userData[0].username}}, config.JwtSecretKey, {
            expiresIn: config.ExpiresIn
          })
        });
      } else {
        return res.sendInvalidUsernameOrPassword();
      }
    });
};

module.exports = authentication;
