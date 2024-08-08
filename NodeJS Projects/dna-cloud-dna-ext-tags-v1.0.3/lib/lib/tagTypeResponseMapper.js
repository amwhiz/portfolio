'use strict';

var _ = require('lodash'),
    TagType = require('./dbStorage').getDb().model('TagTypeExt'),
    fieldsToReturnBuilder = require('./fieldsToReturnBuilder'),
    fieldsToReturn = fieldsToReturnBuilder.build(TagType.schema.paths).split(' ');

function mapTagType(tagType) {
    return _.reduce(fieldsToReturn, function(results, value) {
        results[value] = tagType[value];

        return results;
    }, {});
}

exports.mapTagTypeForGet = function(tagType) {
    return mapTagType(tagType);
};
