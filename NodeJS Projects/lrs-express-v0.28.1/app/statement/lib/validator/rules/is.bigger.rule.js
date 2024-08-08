'use strict';

var messages = require('../validator.messages');

module.exports = function(value, fieldName, min) {
    if (value <= min) {
        return messages.BIGGER(fieldName, min);
    }
};
