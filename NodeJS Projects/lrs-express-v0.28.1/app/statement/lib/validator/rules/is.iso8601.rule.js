'use strict';

var messages = require('../validator.messages'),
    moment = require('moment'),
    date;

module.exports = function(value, fieldName) {
    value = value || '';
    date = moment(value);
    if (!date.isValid()) {
        return messages.ISO8601(fieldName);
    }
};
