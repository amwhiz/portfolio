'use strict';

var messages = require('../validator.messages'),
    mediaType = require('media-type');

module.exports = function(value, fieldName) {
    var media = mediaType.fromString(value);

    if (!media.isValid()) {
        return messages.CONTENT_TYPE(fieldName, value);
    }
};
