'use strict';

var messages = require('../validator.messages');

module.exports = function(value, fieldName, options) {
    if (value < options.min || value > options.max) {
        return messages.BETWEEN(fieldName, options);
    }
};
