'use strict';

var builder = {};

builder.buildOptionsForMultipleGet = function(queryString) {
    var options = {
        sort: {
            'statement.stored': -1
        }
    };

    if (queryString.limit) {
        options.limit = queryString.limit;
    }

    if (queryString.ascending === 'true') {
        options.sort['statement.stored'] = 1;
    }

    return options;
};

module.exports = builder;
