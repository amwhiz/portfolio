'use strict';

var builder = {};

builder.buildOptionsForGet = function(queryString) {
    var options = {
        sort: {
            tagLabel: 1
        }
    };

    if (queryString.limit) {
        options.limit = queryString.limit;
    }

    if (queryString.offset) {
        options.skip = queryString.offset;
    }

    return options;
};

module.exports = builder;
