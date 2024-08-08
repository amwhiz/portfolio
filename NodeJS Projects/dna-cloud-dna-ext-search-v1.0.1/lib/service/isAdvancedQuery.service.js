'use strict';

var includes = require('lodash.includes');

module.exports = function(q) {
    return !!['AND', 'OR', 'NOT', '*', ')', '(']
        .some(function(op) {
            return includes(q, op);
        });
};
