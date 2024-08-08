'use strict';

var _ = require('lodash'),
    sanitizers = require('./sanitizer.collection');

module.exports = function(statement) {
    _.forEach(sanitizers, function(sanitizer) {
        sanitizer(statement);
    });
};
