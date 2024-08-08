'use strict';

const Validator = require('../lib/Validator');
const schema = require('./surveys.schema');

module.exports = new Validator(schema);
