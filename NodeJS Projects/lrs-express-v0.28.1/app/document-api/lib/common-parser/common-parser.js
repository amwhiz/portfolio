'use strict';

var _ = require('lodash');

exports.parseAgent = function(queryParams, agent) {
    var parsedAgent = JSON.parse(agent);

    if (_.has(parsedAgent, 'mbox')) {
        queryParams['agent.mbox'] = parsedAgent.mbox;
    } else if (_.has(parsedAgent, 'mbox_sha1sum')) {
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        queryParams['agent.mbox_sha1sum'] = parsedAgent.mbox_sha1sum;
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    } else if (_.has(parsedAgent, 'openid')) {
        queryParams['agent.openid'] = parsedAgent.openid;
    } else if (_.has(parsedAgent, 'account')) {
        queryParams['agent.account.homePage'] = parsedAgent.account.homePage;
        queryParams['agent.account.name'] = parsedAgent.account.name;
    }
};
