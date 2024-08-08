'use strict';

var _ = require('lodash'),
    TAG_VALUES_SEPARATOR = '|',
    TagRetriever,
    tagTypeSynonyms = require('./tagTypeSynonyms'),
    access = require('object-path').get;

TagRetriever = function(descriptor, tagTypes, errorLog) {
    this.descriptor = descriptor;
    this.tagTypes = tagTypes;
    this.errorLog = errorLog;

    this.tagTypesByTagTypeName = _.indexBy(this.tagTypes, 'tagTypeName');

    _.forEach(this.tagTypesByTagTypeName, function(tagTypeObj) {
        tagTypeObj.tags = _.indexBy(tagTypeObj.tags, 'tagName');
    });
};

TagRetriever.prototype.findTagIdByTagTypeNameAndTagValue = function(tagTypeName, tagValue) {
    return access(this.tagTypesByTagTypeName, [tagTypeName, 'tags', (tagValue + '').trim(), 'tagId'].join('.'));
};

TagRetriever.prototype.findTagsIdsByTagTypeNameAndTagValue = function(tagTypeName, tagValuesCombined) {
    var _this = this;

    return ((tagValuesCombined || '') + '')
        .split(TAG_VALUES_SEPARATOR)
        .reduce(function(tagsIdsByTagTypeNameAndTagValue, tagValue) {
            if (!tagValue.length) {
                return tagsIdsByTagTypeNameAndTagValue;
            }

            var id = _this.findTagIdByTagTypeNameAndTagValue(tagTypeName, tagValue);

            if (id) {
                tagsIdsByTagTypeNameAndTagValue.push(id);
            } else {
                _this.errorLog.push('Tag not found for: "' + [tagTypeName, tagValue].join(': ') + '"');
            }

            return tagsIdsByTagTypeNameAndTagValue;
        }, []);
};

TagRetriever.prototype.findTagsIdsByTagTypeName = function(tagTypeName) {
    return this.findTagsIdsByTagTypeNameAndTagValue(tagTypeName, this.retrieveTagValueFromDescriptor(tagTypeName));
};

TagRetriever.prototype.retrieveTagValueFromDescriptor = function(tagTypeName) {
    var tagSourceValue = this.descriptor[this.translateTagTypeName(tagTypeName)];

    return tagSourceValue;
};

TagRetriever.prototype.translateTagTypeName = function(tagTypeName) {
    var _this = this,
        synonyms = tagTypeSynonyms[tagTypeName] || [];

    synonyms.unshift(tagTypeName);
    return _.find(synonyms, function(tagTypeSynonym) {
        return _.has(_this.descriptor, tagTypeSynonym);
    });
};

TagRetriever.prototype.getTagToSendMap = function(tagTypeObj) {
    return {
        tagId: this.findTagsIdsByTagTypeName(tagTypeObj.tagTypeName),
        tagTypeName: tagTypeObj.tagTypeName,
        tagTypeId: tagTypeObj.tagTypeId
    };
};

TagRetriever.prototype.getTagsToSendMap = function() {
    var _this = this;

    return _.reduce(this.tagTypesByTagTypeName, function(map, tagTypeObj, tagTypeName) {
        var tagToSendMap = {
            translatedTagTypeName: _this.translateTagTypeName(tagTypeName),
            tagToSendMap: _this.getTagToSendMap(tagTypeObj)
        };

        if (access(tagToSendMap, 'tagToSendMap.tagId.length')) {
            map.push(tagToSendMap);
        }

        return map;
    }, []);
};

module.exports = TagRetriever;
