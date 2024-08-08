'use strict';

var Validator = require('./Validator'),
    schema = require('./configSchema');

module.exports = new Validator(schema);
