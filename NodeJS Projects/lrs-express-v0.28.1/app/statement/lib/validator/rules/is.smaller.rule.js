'use strict';

var messages = require('../validator.messages');

module.exports = function(value, fieldName, max) {
    if (value >= max) {
        return messages.SMALLER(fieldName, max);
    }
};
