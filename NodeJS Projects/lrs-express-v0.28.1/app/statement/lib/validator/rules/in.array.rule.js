'use strict';

var messages = require('../validator.messages'),
    _ = require('lodash');

module.exports = function(value, fieldName, options) {
    options = options || {};

    if (!_.contains(options.values, value)) {
        return messages.RANGE(fieldName, options.values);
    }
};
