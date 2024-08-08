'use strict';

var messages = require('../validator.messages');

module.exports = function(value, fieldName, options) {
    options.value = options.value || '';
    if (value === options.value) {
        return messages.IS_NOT(fieldName, options.value);
    }
};
