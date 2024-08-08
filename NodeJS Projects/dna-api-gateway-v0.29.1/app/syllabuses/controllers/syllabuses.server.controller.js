'use strict';

var syllabusesApiClient = require('../../dnaApiClient').dnaSyllabusApiClient;

function getSyllabuses(req, res) {
    return syllabusesApiClient
        .getSyllabuses(req)
        .then(function(data) {
            res.json(data);
        });
}

exports.list = function(req, res, next) {
    return getSyllabuses(req, res)
        .error(function(err) {
            err.repeater = getSyllabuses;
            next(err);
        });
};
