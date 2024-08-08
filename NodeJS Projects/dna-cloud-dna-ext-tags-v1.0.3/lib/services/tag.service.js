'use strict';

var service = {},
    mongoose = require('../lib/dbStorage').getDb(),
    Tag = mongoose.model('TagExt'),
    Bluebird = require('bluebird'),
    additionalInformationDecorator = require('../lib/additionalInformationDecorator'),
    fieldsToReturnBuilder = require('../lib/fieldsToReturnBuilder'),
    fieldsToReturn = fieldsToReturnBuilder.build(Tag.schema.paths),
    _ = require('lodash'),
    errors = require('../errors/errors');

function createQuery(tagId) {
    return {
        tagId: tagId
    };
}

service.getTagsWithCount = function(query, options) {
    return Bluebird
        .all([
            getTags(query, options),
            countTags(query)
        ]);
};

service.getTagsByTagTypeId = function(tagTypeId) {
    return getTagsAsTree({
        tagTypeId: tagTypeId,
        parent: null
    });
};

function getTagsAsTree(query, options) {
    var treeOptions = {
        recursuve: true,
        fields: '-_id tagId tagTypeId tagLabel isDeprecated'
    };

    return Tag
        .findAsync(query, '', options || {})
        .map(function(tag) {
            return Bluebird.all([tag, tag.getChildrenTreeAsync(treeOptions)]);
        })
        .map(function(result) {
            var tag = result[0].toJSON();

            tag.children = result[1];

            return tag;
        });
}

service.countTagsByTagTypeId = function(tagTypeId) {
    return countTags({
        tagTypeId: tagTypeId
    });
};

function getTags(query, options) {
    return Tag
        .findAsync(query, '', options || {})
        .map(function(tag) {
            return Bluebird.all([tag, tag.getAncestorsAsync({}, '-_id tagId')]);
        });
}

function countTags(query) {
    return Tag
        .countAsync(query || {});
}

service.getTagById = function(tagId) {
    return Tag
        .findOneAsync(createQuery(tagId))
        .then(function(tag) {
            return [tag, tag.getChildrenTreeAsync()]
        })
        .spread(function(tag, children) {
            var decoratedTag = tag.toJSON();

            decoratedTag.children = children;

            return decoratedTag;
        });
};

service.createTag = function(document, parent) {
    additionalInformationDecorator.decorate(document, fieldsToReturn);

    document = new Tag(document);
    document.parent = parent || null;

    return document.saveAsync();
};

service.findParent = function(tagTypeId, parentTagId) {
    return Tag
        .findOneAsync({
            tagTypeId: tagTypeId,
            tagId: parentTagId
        });
};

service.checkTagLabel = function(tagTypeId, tagLabel, parentTagId) {
    var query = {
        tagTypeId: tagTypeId,
        tagLabel: tagLabel
    };

    if (parentTagId) {
        query.parent = parentTagId;
    }

    return getTags(query);
};

service.getLastId = function(tagTypeId) {
    return Tag
        .findOneAsync({
            tagTypeId: tagTypeId
        }, 'tagId', {
            sort: '-tagId'
        });
};

service.updateTagById = function(tagId, document) {
    return Tag
        .findOneAndUpdateAsync(createQuery(tagId), document);
};

service.removeTagById = function(tagId) {
    return service
        .getTagById(tagId)
        .then(function(tag) {
            if (!_.isEmpty(tag.children)) {
                throw new errors.CannotRemoveTagWithChildrenError();
            }

            return Tag
                .removeAsync(createQuery(tagId));
        });
};

module.exports = service;
