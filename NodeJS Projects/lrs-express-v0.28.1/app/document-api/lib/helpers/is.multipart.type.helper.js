'use strict';

var _ = require('lodash'),
    contentTypes = require('../content-types/content-types');

module.exports = function(contentType) {
    return _.contains(contentType, contentTypes.FORM_MULTIPART);
};
