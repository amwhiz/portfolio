'use strict';

var _ = require('lodash');

module.exports = function(value) {
    return !_.isEmpty(value);
};
