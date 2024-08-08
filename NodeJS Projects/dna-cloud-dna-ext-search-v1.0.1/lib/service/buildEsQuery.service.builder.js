'use strict';

var decorateEsQueryBody = require('./decorateEsQueryBody.service');

module.exports = function(elasticsearchConfiguration) {
    return function(query, filters, sortBy) {
        var esQuery = {
            index: elasticsearchConfiguration.index,
            type: 'descriptor',
            lowercaseExpandedTerms: true,
            body: {}
        };

        decorateEsQueryBody(esQuery.body, query, filters, sortBy);

        return esQuery;
    };
};
