'use strict';

var activityParser = require('../lib/activity-parser/activity-parser'),
    activityQueryValidator = require('../lib/activity-query-validator/activity-validator'),
    activityService = require('../services/activity.service'),
    documentService = require('../services/document.service'),
    _ = require('lodash'),
    getLrs = require('../lib/helpers/get.lrs.helper'),
    isMultipartType = require('../lib/helpers/is.multipart.type.helper'),
    isCorrectType = require('../lib/helpers/is.correct.type.helper'),
    hasValidParams = require('../lib/helpers/has.valid.params.helper'),
    contentTypes = require('../lib/content-types/content-types'),
    createOrUpdateProfile,
    validator = require('express-validator').validator,
    Bluebird = require('bluebird'),
    ParamsValidationError = require('../errors/ParamsValidation.error'),
    InvalidContentError = require('../errors/InvalidContent.error'),
    ID_FIELD = 'profileId';

exports.getActivity = function(req, res, next) {
    Bluebird
        .resolve(activityQueryValidator.validateActivityGet(req.query))
        .then(function(valid) {
            if (!valid) {
                throw new ParamsValidationError();
            }

            return activityParser.parseActivityGetParams(getLrs(req), req.query);
        })
        .then(function(parsedData) {
            return activityService.getActivity(parsedData);
        })
        .then(function(data) {
            res.sendData(data);
        })
        .catch(ParamsValidationError, function(error) {
            res.sendBadRequest(error);
        })
        .catch(next);
};

exports.getProfiles = function(req, res, next) {
    Bluebird
        .resolve(activityQueryValidator.validateGet(req.query))
        .then(function(valid) {
            if (!valid) {
                throw new ParamsValidationError();
            }

            return activityParser.parseGetParams(getLrs(req), req.query);
        })
        .then(function(params) {
            return documentService.getDocument(params, ID_FIELD);
        })
        .then(function(data) {
            res.sendData(_.isArray(data) ? _.pluck(data, ID_FIELD) : data);
        })
        .catch(ParamsValidationError, function(error) {
            res.sendBadRequest(error);
        })
        .catch(next);
};

exports.updateProfile = function(req, res, next) {
    createOrUpdateProfile(req, res, next, false);
};

exports.createProfile = function(req, res, next) {
    createOrUpdateProfile(req, res, next, true);
};

createOrUpdateProfile = function(req, res, next, merge) {
    Bluebird
        .all([isMultipartType(req.getContentType())])
        .spread(function(isMultipart) {
            if (isMultipart) {
                return documentService.parseForm(req);
            }

            return Bluebird.all([]);
        })
        .spread(function(params, files) {
            return Bluebird.all([documentService.flatParams(params), files, req.getContentType(), getLrs(req)]);
        })
        .spread(function(params, files, contentType, lrsId) {
            if (isMultipartType(contentType) && activityQueryValidator.validatePost(params) && _.has(files, 'content') && files.content.length) {
                return Bluebird.all([activityParser.parsePostParams(lrsId, params), documentService.saveFile(files.content[0])]);
            } else if (isMultipartType(contentType) && activityQueryValidator.validatePost(params)) {
                var content = validator.isJSON(params.content) ? [JSON.parse(params.content), contentTypes.JSON] : [params.content, contentTypes.TEXT];

                return Bluebird.all([activityParser.parsePostParams(lrsId, params), content]);
            } else if (isCorrectType(contentType, req.body, contentTypes.FORM_URL, activityQueryValidator.validatePost)
                || isCorrectType(contentType, req.body, contentTypes.JSON, activityQueryValidator.validatePost)) {
                return Bluebird.all([activityParser.parsePostParams(lrsId, req.body), [req.body.content, contentType]]);
            } else if (hasValidParams(req.query, activityQueryValidator.validatePost)) {
                return Bluebird.all([activityParser.parsePostParams(lrsId, req.query), [req.body, contentType]]);
            } else {
                throw new ParamsValidationError();
            }
        })
        .spread(function(params, content) {
            return documentService.createOrUpdateDocument(params, content[0], content[1], merge);
        })
        .then(function() {
            res.sendNoContent();
        })
        .catch(InvalidContentError, function(error) {
            documentService.removeFile(error.getContent());
            res.sendBadRequest(error);
        })
        .catch(ParamsValidationError, function(error) {
            res.sendBadRequest(error);
        })
        .catch(next);
};

exports.deleteProfiles = function(req, res, next) {
    Bluebird
        .resolve(activityQueryValidator.validatePost(req.query))
        .then(function(valid) {
            if (!valid) {
                throw new ParamsValidationError();
            }

            return activityParser.parsePostParams(getLrs(req), req.query);
        })
        .then(function(params) {
            return documentService.deleteDocument(params);
        })
        .then(function() {
            res.sendNoContent();
        })
        .catch(ParamsValidationError, function(error) {
            res.sendBadRequest(error);
        })
        .catch(next);
};
