'use strict';

var messages = require('../validator.messages'),
    _ = require('lodash');

module.exports = function(value, fieldName) {
    if (_.isEmpty(value)) {
        return messages.REQUIRED(fieldName);
    }
};
