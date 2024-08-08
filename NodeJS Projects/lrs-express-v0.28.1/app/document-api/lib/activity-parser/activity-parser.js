'use strict';

var _ = require('lodash'),
    documentTypes = require('../document-types/document-types'),
    queryParams,
    optionalParams;

exports.parseActivityGetParams = function(lrsId, queryString) {
    return {
        lrs: lrsId,
        activityId: queryString.activityId
    };
};

exports.parseGetParams = function(lrsId, queryString) {
    queryParams = {
        lrs: lrsId,
        documentType: documentTypes.ACTIVITY,
        activityId: queryString.activityId
    };

    optionalParams = {};

    if (!_.isEmpty(queryString.since)) {
        optionalParams.createdAt = {$gt: new Date(queryString.since)};
    }

    if (!_.isEmpty(queryString.profileId)) {
        optionalParams.profileId = queryString.profileId;
    }

    return _.extend(queryParams, optionalParams);
};

exports.parsePostParams = function(lrsId, queryString) {
    return {
        lrs: lrsId,
        documentType: documentTypes.ACTIVITY,
        activityId: queryString.activityId,
        profileId: queryString.profileId
    };
};
