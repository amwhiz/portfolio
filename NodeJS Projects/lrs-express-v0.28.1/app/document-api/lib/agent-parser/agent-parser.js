'use strict';

var _ = require('lodash'),
    documentTypes = require('../document-types/document-types'),
    queryParams,
    optionalParams,
    parseAgent = require('../common-parser/common-parser').parseAgent;

exports.parseCombineGet = function(queryString) {
    return {
        agent: JSON.parse(queryString.agent)
    };
};

exports.parseGetParams = function(lrsId, queryString) {
    queryParams = {
        lrs: lrsId,
        documentType: documentTypes.AGENT
    };

    parseAgent(queryParams, queryString.agent);

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
    queryParams = {
        lrs: lrsId,
        documentType: documentTypes.AGENT,
        profileId: queryString.profileId
    };

    parseAgent(queryParams, queryString.agent);

    return queryParams;
};
