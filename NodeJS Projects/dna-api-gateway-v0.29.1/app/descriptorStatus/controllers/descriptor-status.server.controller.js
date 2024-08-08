'use strict';

var dnaDescriptorStatusApiClient = require('../../dnaApiClient').dnaDescriptorStatusApiClient;

function getDescriptorStatus(req, res) {
    return dnaDescriptorStatusApiClient
        .getDescriptorStatusList(req)
        .then(function(data) {
            res.json(data);
        });
}

exports.list = function(req, res, next) {
    return getDescriptorStatus(req, res)
        .error(function(err) {
            err.repeater = getDescriptorStatus;
            next(err);
        });
};

exports.defaultStatuses = function(req, res) {
    return res.json(dnaDescriptorStatusApiClient
        .getDefaultDescriptorStatusesKeys(req));
};
