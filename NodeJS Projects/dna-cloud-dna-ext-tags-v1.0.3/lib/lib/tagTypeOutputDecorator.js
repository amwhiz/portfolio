'use strict';

var _ = require('lodash'),
    tagResponseMapper = require('./tagResponseMapper'),
    tagTypeResponseMapper = require('./tagTypeResponseMapper');

function mapTags(tags) {
    return _.map(tags, function(tag) {
        return tagResponseMapper.mapTagForGet(tag);
    });
}

exports.decorateWithTags = function(tagType, tags, expand) {
    tagType = tagTypeResponseMapper.mapTagTypeForGet(tagType);

    if (expand) {
        tagType.tags = mapTags(tags);
    } else {
        tagType.tags = _.map(tags, 'tagId');
    }

    return tagType;
};

exports.decorateWithCount = function(tagType, count) {
    tagType = tagType.toJSON();
    tagType.tagCount = count;

    return tagType;
};
