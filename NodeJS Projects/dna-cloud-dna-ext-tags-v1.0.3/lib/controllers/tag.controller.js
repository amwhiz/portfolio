'use strict';

var tagService = require('../services/tag.service'),
    tagTypeService = require('../services/tagType.service'),
    _ = require('lodash'),
    queryBuilder = require('../lib/tagQueryBuilder'),
    optionsBuilder = require('../lib/tagOptionsBuilder'),
    Bluebird = require('bluebird'),
    errors = require('../errors/errors'),
    tagValidator = require('../lib/tagValidator'),
    tagIdGenerator = require('../lib/tagIdGenerator'),
    commonValidator = require('../lib/commonValidator'),
    tagResponseMapper = require('../lib/tagResponseMapper');

exports.getTags = function(req, res, next) {
    var query = queryBuilder.buildQueryForGet(req.query),
        options = optionsBuilder.buildOptionsForGet(req.query);

    tagService
        .getTagsWithCount(query, options)
        .spread(function(data, count) {
            return [tagResponseMapper.mapTagsForFlatList(data), count]
        })
        .spread(function(data, count) {
            res.sendSuccess({
                count: count,
                data: data
            });
        })
        .catch(function(err) {
            next(err);
        });
};

exports.getTagById = function(req, res, next) {
    tagService
        .getTagById(req.params.tagId)
        .then(function(tag) {
            if (_.isEmpty(tag)) {
                res.sendNotFound();
            } else {
                res.sendSuccess(tagResponseMapper.mapTagForGet(tag));
            }
        })
        .catch(function(err) {
            next(err);
        });
};

exports.createTag = function(req, res, next) {
    Bluebird.all([
        tagTypeService.getTagTypeById(req.body.tagTypeId),
        tagService.findParent(req.body.tagTypeId, req.body.parentTagId)
    ])
        .spread(function(tagType, parent) {
            if (_.isEmpty(tagType)) {
                throw new errors.MissingTagTypeError(req.body.tagTypeId);
            }

            if (req.body.parentTagId && _.isEmpty(parent)) {
                throw new errors.CannotFindParentError();
            }

            return [tagService.checkTagLabel(req.body.tagTypeId, req.body.tagLabel, _.get(parent, '_id', '')), parent, tagService.getLastId(req.body.tagTypeId)];
        })
        .spread(function(tag, parent, lastId) {
            if (!_.isEmpty(tag)) {
                throw new errors.NotUniqTagLabelError(req.body.parentTagId, req.body.tagLabel);
            }

            req.body.tagId = tagIdGenerator.generateId(req.body.tagTypeId, _.get(lastId, 'tagId'));

            return [tagValidator.validate(req.body), parent];
        })
        .spread(function(tag, parent) {
            return tagService.createTag(tag, parent);
        })
        .then(function(data) {
            res.sendCreated(data);
        })
        .catch(errors.MissingTagTypeError, errors.CannotFindParentError, function(err) {
            res.sendBadRequest(err.getMessage());
        })
        .catch(errors.DuplicatedTagError, errors.NotUniqTagLabelError, function(err) {
            res.sendConflict(err.getMessage());
        })
        .catch(function(err) {
            if (_.get(err, 'name') === 'ValidationError') {
                res.sendBadRequest(err);
            } else {
                next(err);
            }
        });
};

exports.updateTagById = function(req, res, next) {
    tagValidator
        .validate(req.body)
        .then(function() {
            if (commonValidator.checkId(req.params.tagId, req.body.tagId)) {
                throw new errors.CannotEditTagIdError();
            }

            return tagService.updateTagById(req.params.tagId, req.body);
        })
        .then(function(data) {
            res.sendCreated(data);
        })
        .catch(errors.CannotEditTagIdError, function(err) {
            res.sendConflict(err);
        })
        .catch(function(err) {
            if (_.get(err, 'name') === 'ValidationError') {
                res.sendBadRequest(err);
            } else {
                next(err);
            }
        });
};

exports.removeTagById = function(req, res, next) {
    tagService
        .removeTagById(req.params.tagId)
        .then(function(data) {
            if (data[0]) {
                res.status(202).send();
            } else {
                res.sendNoContent();
            }
        })
        .catch(errors.CannotRemoveTagWithChildrenError, function(err) {
            res.sendConflict(err);
        })
        .catch(function(err) {
            next(err);
        });
};
