'use strict';

var _ = require('lodash'),
    Tag = require('./dbStorage').getDb().model('TagExt'),
    fieldsToReturnBuilder = require('./fieldsToReturnBuilder'),
    fieldsToReturn = fieldsToReturnBuilder.build(Tag.schema.paths).split(' '),
    _this = this;

function mapTag(tag) {
    return _.reduce(fieldsToReturn, function(results, value) {
        if (!_.isUndefined(tag[value])) {
            results[value] = tag[value];
        }

        return results;
    }, {});
}

exports.mapTagsForFlatList = function(tags) {
    return _.map(tags, function(tag) {
        var mappedTag = mapTag(tag[0]);

        mappedTag.tagParents = _.map(tag[1], 'tagId');

        return mappedTag;
    });
};

exports.mapTagForGet = function(tag) {
    if (!_.isEmpty(tag.children)) {
        tag.children = _.map(tag.children, function(tag) {
            return _this.mapTagForGet(tag);
        });
    }

    return mapTag(tag);
};
