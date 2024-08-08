'use strict';

var builder = {},
    buildFilters,
    _assign = require('lodash').assign;

buildFilters = function(queryFilters) {
    var filters = {};

    queryFilters = JSON.parse(queryFilters);

    if (queryFilters.tagTypeId) {
        filters.tagTypeId = { $in: queryFilters.tagTypeId };
    }

    return filters;
};

builder.buildQueryForGet = function(queryString) {
    var params = {};

    if (queryString.q) {
        params.tagLabel = {
            $regex: queryString.q,
            $options: '-i'
        };
    }

    if (queryString.filters) {
        params = _assign(params, buildFilters(queryString.filters));
    }

    return params;
};

module.exports = builder;
