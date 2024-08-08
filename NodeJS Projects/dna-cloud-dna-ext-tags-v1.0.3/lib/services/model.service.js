'use strict';

var service = {};

service.checkForDuplicate = function(Model, Error, fieldName, data, cb, query) {
    query = query || {};
    query[fieldName] = data[fieldName];

    Model.count(query, function(err, count) {
        if (err) {
            return cb(err);
        } else if (count) {
            return cb(new Error(data[fieldName]));
        } else {
            cb();
        }
    });
};

module.exports = service;
