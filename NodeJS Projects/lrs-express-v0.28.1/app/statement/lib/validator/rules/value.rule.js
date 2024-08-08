'use strict';

var messages = require('../validator.messages');

module.exports = function(value, fieldName, options) {
    options = options || {};

    if (value !== options.value) {
        return messages.VALUE(fieldName, options.value);
    }
};
