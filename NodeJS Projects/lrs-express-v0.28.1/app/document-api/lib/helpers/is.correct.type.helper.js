'use strict';

var _ = require('lodash');

module.exports = function(contentType, params, type, validator) {
    return _.contains(contentType, type)
        && _.has(params, 'content')
        && validator(params);
};
