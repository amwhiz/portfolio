'use strict';

var stateParser = require('../lib/state-parser/state-parser'),
    stateQueryValidator = require('../lib/state-query-validator/state-validator'),
    documentService = require('../services/document.service'),
    _ = require('lodash'),
    getLrs = require('../lib/helpers/get.lrs.helper'),
    isMultipartType = require('../lib/helpers/is.multipart.type.helper'),
    isCorrectType = require('../lib/helpers/is.correct.type.helper'),
    hasValidParams = require('../lib/helpers/has.valid.params.helper'),
    createOrUpdateState,
    contentTypes = require('../lib/content-types/content-types'),
    validator = require('express-validator').validator,
    Bluebird = require('bluebird'),
    ParamsValidationError = require('../errors/ParamsValidation.error'),
    InvalidContentError = require('../errors/InvalidContent.error'),
    ID_FIELD = 'stateId';

exports.getStates = function(req, res, next) {
    Bluebird
        .resolve(stateQueryValidator.validateGet(req.query))
        .then(function(valid) {
            if (!valid) {
                throw new ParamsValidationError();
            }

            return stateParser.parseGetParams(getLrs(req), req.query);
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

exports.updateState = function(req, res, next) {
    createOrUpdateState(req, res, next, false);
};

exports.createState = function(req, res, next) {
    createOrUpdateState(req, res, next, true);
};

createOrUpdateState = function(req, res, next, merge) {
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
            if (isMultipartType(contentType) && stateQueryValidator.validatePost(params) && _.has(files, 'content') && files.content.length) {
                return Bluebird.all([stateParser.parsePostParams(lrsId, params), documentService.saveFile(files.content[0])]);
            } else if (isMultipartType(contentType) && stateQueryValidator.validatePost(params)) {
                var content = validator.isJSON(params.content) ? [JSON.parse(params.content), contentTypes.JSON] : [params.content, contentTypes.TEXT];

                return Bluebird.all([stateParser.parsePostParams(lrsId, params), content]);
            } else if (isCorrectType(contentType, req.body, contentTypes.FORM_URL, stateQueryValidator.validatePost)
                || isCorrectType(contentType, req.body, contentTypes.JSON, stateQueryValidator.validatePost)) {
                return Bluebird.all([stateParser.parsePostParams(lrsId, req.body), [req.body.content, contentType]]);
            } else if (hasValidParams(req.query, stateQueryValidator.validatePost)) {
                return Bluebird.all([stateParser.parsePostParams(lrsId, req.query), [req.body, contentType]]);
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

exports.deleteStates = function(req, res, next) {
    Bluebird
        .resolve(stateQueryValidator.validateGet(req.query))
        .then(function(valid) {
            if (!valid) {
                throw new ParamsValidationError();
            }

            return stateParser.parseGetParams(getLrs(req), req.query);
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
