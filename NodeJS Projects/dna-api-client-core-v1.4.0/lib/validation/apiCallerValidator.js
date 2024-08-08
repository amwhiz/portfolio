'use strict';

var Validator = require('./Validator'),
    schema = require('./apiCallerSchema');

module.exports = new Validator(schema);
