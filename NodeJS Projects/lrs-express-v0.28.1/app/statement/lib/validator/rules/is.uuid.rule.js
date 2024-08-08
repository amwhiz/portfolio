'use strict';

var messages = require('../validator.messages'),
    expressValidator = require('express-validator').validator;

module.exports = function(value, fieldName) {
    if (!expressValidator.isUUID(value)) {
        return messages.UUID(fieldName);
    }
};
