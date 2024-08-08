'use strict';

var _ = require('lodash'),
    validators = require('./validator.collection'),
    messages = require('../validator/validator.messages.js'),
    exist = require('./helpers/exist.helper.js'),
    statementValidator = {},
    validateStatement;

validateStatement = function(statement) {
    var errors = [];

    if (!exist(statement)) {
        return [messages.REQUIRED('statement')];
    }

    validators.forEach(function(validator) {
        errors = errors.concat(validator(statement));
    });

    return errors;
};

statementValidator.validate = function(statement) {
    return validateStatement(statement);
};

module.exports = statementValidator;
