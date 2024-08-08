'use strict';

var dnaTagsApiClient = require('../../dnaApiClient').dnaTagsApiClient;

function getTags(req, res) {
    return dnaTagsApiClient
        .getTags(req)
        .then(function(data) {
            res.json(data);
        });
}

function getGSETags(req, res) {
    return dnaTagsApiClient
        .getGSETags(req)
        .then(function(data) {
            res.json(data);
        });
}

function getSkillTags(req, res) {
    return dnaTagsApiClient
        .getSkillTags(req)
        .then(function(data) {
            res.json(data);
        });
}

exports.list = function(req, res, next) {
    getTags(req, res)
        .error(function(err) {
            err.repeater = getTags;
            next(err);
        });
};

exports.gse = function(req, res, next) {
    getGSETags(req, res)
        .error(function(err) {
            err.repeater = getGSETags;
            next(err);
        });
};

exports.skill = function(req, res, next) {
    getSkillTags(req, res)
        .error(function(err) {
            err.repeater = getSkillTags;
            next(err);
        });
};

function getExtTags(req, res) {
    return dnaTagsApiClient
        .getExtTags(req)
        .then(function(data) {
            res.json(data);
        });
}

exports.getExtTags = function(req, res, next) {
    getExtTags(req, res)
        .error(function(err) {
            err.repeater = getExtTags;
            next(err);
        });
};

function getExtTag(req, res) {
    return dnaTagsApiClient
        .getExtTag(req)
        .then(function(data) {
            res.json(data);
        });
}

exports.getExtTag = function(req, res, next) {
    getExtTag(req, res)
        .error(function(err) {
            err.repeater = getExtTag;
            next(err);
        });
};

function postExtTag(req, res) {
    return dnaTagsApiClient
        .postExtTag(req)
        .then(function(data) {
            res.json(data);
        });
}

exports.postExtTag = function(req, res, next) {
    postExtTag(req, res)
        .error(function(err) {
            err.repeater = postExtTag;
            next(err);
        });
};

function putExtTag(req, res) {
    return dnaTagsApiClient
        .putExtTag(req)
        .then(function(data) {
            res.json(data);
        });
}

exports.putExtTag = function(req, res, next) {
    putExtTag(req, res)
        .error(function(err) {
            err.repeater = putExtTag;
            next(err);
        });
};

function deleteExtTag(req, res) {
    return dnaTagsApiClient
        .deleteExtTag(req)
        .then(function(data) {
            res.json(data);
        });
}

exports.deleteExtTag = function(req, res, next) {
    deleteExtTag(req, res)
        .error(function(err) {
            err.repeater = deleteExtTag;
            next(err);
        });
};

function getExtTagTypes(req, res) {
    return dnaTagsApiClient
        .getExtTagTypes(req)
        .then(function(data) {
            res.json(data);
        });
}

exports.getExtTagTypes = function(req, res, next) {
    getExtTagTypes(req, res)
        .error(function(err) {
            err.repeater = getExtTagTypes;
            next(err);
        });
};

function getExtTagType(req, res) {
    return dnaTagsApiClient
        .getExtTagType(req)
        .then(function(data) {
            res.json(data);
        });
}

exports.getExtTagType = function(req, res, next) {
    getExtTagType(req, res)
        .error(function(err) {
            err.repeater = getExtTagType;
            next(err);
        });
};

function postExtTagType(req, res) {
    return dnaTagsApiClient
        .postExtTagType(req)
        .then(function(data) {
            res.json(data);
        });
}

exports.postExtTagType = function(req, res, next) {
    postExtTagType(req, res)
        .error(function(err) {
            err.repeater = postExtTagType;
            next(err);
        });
};

function putExtTagType(req, res) {
    return dnaTagsApiClient
        .putExtTagType(req)
        .then(function(data) {
            res.json(data);
        });
}

exports.putExtTagType = function(req, res, next) {
    putExtTagType(req, res)
        .error(function(err) {
            err.repeater = putExtTagType;
            next(err);
        });
};

function deleteExtTagType(req, res) {
    return dnaTagsApiClient
        .deleteExtTagType(req)
        .then(function(data) {
            res.json(data);
        });
}

exports.deleteExtTagType = function(req, res, next) {
    deleteExtTagType(req, res)
        .error(function(err) {
            err.repeater = deleteExtTagType;
            next(err);
        });
};
