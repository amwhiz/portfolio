'use strict';

var Bluebird = require('bluebird'),
    isAdvancedQuery = require('./isAdvancedQuery.service'),
    buildEsQueryBuilder = require('./buildEsQuery.service.builder'),
    transformEsResponseBody = require('./transformEsResponseBody.service'),
    jsonPromise = require('json-parse-promise');

module.exports = function(elasticsearchClient, elasticsearchConfiguration) {
    var buildEsQuery = buildEsQueryBuilder(elasticsearchConfiguration);

    return function(query) {
        return Bluebird
            .all([
                jsonPromise.parse(query.filters),
                jsonPromise.parse(query.sortBy)
            ])
            .spread(function(filters, sortBy) {
                return buildEsQuery(query, filters, sortBy);
            })
            .then(function(esQuery) {
                return elasticsearchClient.search(esQuery);
            })
            .then(function(esResponseBody) {
                return transformEsResponseBody(esResponseBody, isAdvancedQuery(query.q));
            });
    };
};
