'use strict';

var tagTypeService = require('../services/tagType.service'),
    tagService = require('../services/tag.service'),
    _ = require('lodash'),
    tagTypeOutputDecorator = require('../lib/tagTypeOutputDecorator'),
    tagTypeValidator = require('../lib/tagTypeValidator'),
    Bluebird = require('bluebird'),
    errors = require('../errors/errors'),
    tagTypeIdGenerator = require('../lib/tagTypeIdGenerator'),
    commonValidator = require('../lib/commonValidator'),
    tagTypeResponseMapper = require('../lib/tagTypeResponseMapper');

exports.getTagTypes = function(req, res, next) {
    tagTypeService
        .getTagTypes()
        .map(function(tagType) {
            if (req.query.expand) {
                return Bluebird.all([tagType, tagService.getTagsByTagTypeId(tagType.tagTypeId)]);
            } else {
                return Bluebird.all([tagType, tagService.countTagsByTagTypeId(tagType.tagTypeId)]);
            }
        })
        .map(function(result) {
            if (req.query.expand) {
                return tagTypeOutputDecorator.decorateWithTags(result[0], result[1], req.query.expand);
            } else {
                return tagTypeOutputDecorator.decorateWithCount(result[0], result[1]);
            }
        })
        .then(function(outputCollection) {
            res.sendSuccess(outputCollection);
        })
        .catch(function(err) {
            next(err);
        });
};

exports.getTagTypeById = function(req, res, next) {
    Bluebird
        .all([
            tagTypeService.getTagTypeById(req.params.tagTypeId),
            tagService.getTagsByTagTypeId(req.params.tagTypeId)
        ])
        .spread(function(tagType, tags) {
            if (_.isEmpty(tagType)) {
                res.sendNotFound();
            } else {
                res.sendSuccess(tagTypeOutputDecorator.decorateWithTags(tagType, tags, req.query.expand));
            }
        })
        .catch(function(err) {
            next(err);
        });
};

exports.createTagType = function(req, res, next) {
    Bluebird
        .resolve(req.body)
        .then(function(data) {
            if (_.isEmpty(data.tagId)) {
                data.tagId = tagTypeIdGenerator.generateId(data.tagTypeLabel);
            }

            return tagTypeValidator.validate(data);
        })
        .then(function(data) {
            return tagTypeService.createTagType(data);
        })
        .then(function(tagType) {
            res.sendCreated(tagTypeResponseMapper.mapTagTypeForGet(tagType));
        })
        .catch(errors.DuplicatedTagTypeError, function(err) {
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

exports.updateTagTypeById = function(req, res, next) {
    tagTypeValidator
        .validate(req.body)
        .then(function() {
            if (commonValidator.checkId(req.params.tagTypeId, req.body.tagTypeId)) {
                throw new errors.CannotEditTagTypeIdError();
            }

            return tagTypeService.updateTagTypeById(req.params.tagTypeId, req.body);
        })
        .then(function(tagType) {
            res.sendCreated(tagTypeResponseMapper.mapTagTypeForGet(tagType));
        })
        .catch(errors.CannotEditTagTypeIdError, function(err) {
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

exports.removeTagTypeById = function(req, res, next) {
    tagService
        .countTagsByTagTypeId(req.params.tagTypeId)
        .then(function(count) {
            if (count) {
                throw new errors.NotEmptyTagTypeError();
            } else {
                return tagTypeService.removeTagTypeById(req.params.tagTypeId);
            }
        })
        .then(function(data) {
            if (data[0]) {
                res.status(202).send();
            } else {
                res.sendNoContent();
            }
        })
        .catch(errors.NotEmptyTagTypeError, function(err) {
            res.sendConflict(err.getMessage());
        })
        .catch(function(err) {
            next(err);
        });
};
