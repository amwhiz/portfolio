// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
'use strict';

var _ = require('lodash'),
    documentTypes = require('../document-types/document-types'),
    queryParams,
    optionalParams,
    parseAgent = require('../common-parser/common-parser').parseAgent;

exports.parseGetParams = function(lrsId, queryString) {
    queryParams = {
        lrs: lrsId,
        documentType: documentTypes.STATE,
        activityId: queryString.activityId
    };

    parseAgent(queryParams, queryString.agent);

    optionalParams = {};

    if (!_.isEmpty(queryString.registration)) {
        optionalParams.registration = queryString.registration;
    }

    if (!_.isEmpty(queryString.since)) {
        optionalParams.createdAt = {$gt: new Date(queryString.since)};
    }

    if (!_.isEmpty(queryString.stateId)) {
        optionalParams.stateId = queryString.stateId;
    }

    return _.extend(queryParams, optionalParams);
};

exports.parsePostParams = function(lrsId, queryString) {
    queryParams = {
        lrs: lrsId,
        documentType: documentTypes.STATE,
        activityId: queryString.activityId,
        stateId: queryString.stateId
    };

    parseAgent(queryParams, queryString.agent);

    optionalParams = {};

    if (!_.isEmpty(queryString.registration)) {
        optionalParams.registration = queryString.registration;
    } else {
        optionalParams.registration = null;
    }

    return _.extend(queryParams, optionalParams);
};
