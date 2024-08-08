'use strict';

var ActivityModel = require('mongoose').model('Activity');

exports.getActivity = function(callback, queryParams) {
    return ActivityModel
        .findOneAsync(queryParams || {});
};
