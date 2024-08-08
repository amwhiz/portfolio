'use strict';

var validator = {},
    _ = require('lodash');

validator.validateIds = function(queryString) {
    return !(_.has(queryString, 'statementId') && _.has(queryString, 'voidedStatementId'));
};

module.exports = validator;
