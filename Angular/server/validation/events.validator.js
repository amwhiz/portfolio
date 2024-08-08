'use strict';

let Validator = require('../lib/Validator'),
  schema = require('./events.schema');

module.exports = new Validator(schema);
