'use strict';

var messages = require('../validator.messages'),
    _ = require('lodash');

module.exports = function(value, fieldName) {
    if (!_.isString(value)) {
        return messages.STRING(fieldName);
    }
};
