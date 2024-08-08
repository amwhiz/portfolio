'use strict';

var messages = require('../validator.messages'),
    expressValidator = require('express-validator').validator;

module.exports = function(value, fieldName) {
    if (!expressValidator.isBase64(value)) {
        return messages.BASE64(fieldName, value);
    }
};
