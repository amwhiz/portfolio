'use strict';

var dnaDescriptorsApiClient = require('../../dnaApiClient').dnaDescriptorsApiClient;

function getDescriptor(req, res) {
    return dnaDescriptorsApiClient
        .getDescriptor(req)
        .then(function(data) {
            res.json(data);
        });
}

function deleteDescriptor(req, res) {
    return dnaDescriptorsApiClient
        .deleteDescriptor(req)
        .then(function(data) {
            res.json(data);
        });
}

function postDescriptor(req, res) {
    return dnaDescriptorsApiClient
        .postDescriptor(req)
        .then(function(data) {
            res.json(data);
        });
}

function putDescriptor(req, res) {
    return dnaDescriptorsApiClient
        .putDescriptor(req)
        .then(function(data) {
            res.json(data);
        });
}

function searchDescriptor(req, res) {
    return dnaDescriptorsApiClient
        .searchDescriptor(req)
        .then(function(data) {
            res.json(data);
        });
}

function getDescriptorHistory(req, res) {
    return dnaDescriptorsApiClient
        .getDescriptorHistory(req)
        .then(function(data) {
            res.json(data);
        });
}

exports.getDescriptorById = function(req, res, next) {
    getDescriptor(req, res)
        .error(function(err) {
            err.repeater = getDescriptor;
            next();
        });
};

exports.removeDescriptorById = function(req, res, next) {
    if (!req.canEdit()) {
        res.sendForbidden(res);
    } else {
        deleteDescriptor(req, res)
            .error(function(err) {
                err.repeater = deleteDescriptor;
                next(err);
            });
    }
};

exports.create = function(req, res, next) {
    if (!req.canEdit()) {
        res.sendForbidden(res);
    } else {
        postDescriptor(req, res)
            .error(function(err) {
                err.repeater = postDescriptor;
                next(err);
            });
    }
};

exports.update = function(req, res, next) {
    if (!req.canEdit()) {
        res.sendForbidden(res);
    } else {
        putDescriptor(req, res)
            .error(function(err) {
                err.repeater = putDescriptor;
                next(err);
            });
    }
};

exports.search = function(req, res, next) {
    return searchDescriptor(req, res)
        .error(function(err) {
            err.repeater = searchDescriptor;
            next(err);
        });

};

exports.history = function(req, res, next) {
    getDescriptorHistory(req, res)
        .error(function(err) {
            err.repeater = getDescriptorHistory;
            next(err);
        });
};
