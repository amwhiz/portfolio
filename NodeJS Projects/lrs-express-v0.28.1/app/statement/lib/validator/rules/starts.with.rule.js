'use strict';

var messages = require('../validator.messages'),
    _ = require('lodash');

module.exports = function(value, fieldName, options) {
    options = options || {};
    value = value || '';

    if (!_.has(options, 'substring')) {
        return;
    }

    if (value.substring(0, options.substring.length) !== options.substring) {
        return messages.NOT_STARTS(fieldName, options.substring);
    }
};
