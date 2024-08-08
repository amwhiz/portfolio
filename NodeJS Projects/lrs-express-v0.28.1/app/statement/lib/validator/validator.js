'use strict';

var messages = require('./validator.messages'),
    safeAccess = require('safe-access'),
    _ = require('lodash'),
    validator = {},
    rules = require('./rule.collection');

validator.check = function(obj, fieldName, validationRules) {
    var errors = [],
        error;

    obj = safeAccess(obj);
    validationRules.forEach(function(validationRule) {
        if (_.has(rules, validationRule.rule)) {
            error = rules[validationRule.rule](obj(fieldName), fieldName, validationRule.options);
            if (error) {
                errors.push(error);
            }
        }
    });
    return errors;

};

module.exports = validator;
