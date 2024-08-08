'use strict';

var DescriptorsSearchController,
    handleSearchRequestQueryBuilder = require('../service/handleSearchRequestQuery.service.builder');

DescriptorsSearchController = function(elasticsearchClient, elasticsearchConfiguration) {
    this.elasticsearchClient = elasticsearchClient;
    this.elasticsearchConfiguration = elasticsearchConfiguration;
    this.handleSearchRequestQuery = handleSearchRequestQueryBuilder(this.elasticsearchClient, this.elasticsearchConfiguration);
};

DescriptorsSearchController.prototype.search = function(req, res, next) {
    return this.handleSearchRequestQuery(req.query)
        .then(function(responseBody) {
            res.json(responseBody);
        })
        .error(function(error) {
            next(error);
        })
        .catch(function(error) {
            next(error);
        });
};

module.exports = DescriptorsSearchController;
