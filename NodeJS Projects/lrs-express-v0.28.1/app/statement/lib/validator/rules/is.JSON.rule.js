'use strict';

var messages = require('../validator.messages');

module.exports = function(value, fieldName) {
    try {
        JSON.parse(value);
    } catch (err) {
        return messages.JSON(fieldName);
    }
};
