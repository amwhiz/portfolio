'use strict';

var messages = require('../validator.messages'),
    _ = require('lodash');

module.exports = function(value, fieldName) {
    if (!_.isUndefined(value) && !_.isEmpty(value)) {
        return messages.NOT_EXIST(fieldName);
    }
};
