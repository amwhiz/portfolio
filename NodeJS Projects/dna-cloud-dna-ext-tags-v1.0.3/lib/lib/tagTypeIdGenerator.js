'use strict';

var generator = {},
    _ = require('lodash'),
    errors = require('../errors/errors');

generator.generateId = function(tagTypeLabel){
    if (_.isEmpty(tagTypeLabel)) {
        throw new errors.MissingTagTypeLabelError();
    }

    return (tagTypeLabel + '').substring(0, 3).toUpperCase();
};

module.exports = generator;
