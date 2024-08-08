'use strict';

var DescriptorsSearchController = require('../controller/DescriptorsSearchController'),
    consts = require('../consts');

module.exports = function(router, middlewares, dnaElasticsearch) {
    var descriptorsSearchController = new DescriptorsSearchController(dnaElasticsearch.Connection.client, dnaElasticsearch.Configuration.config);

    router
        .route(consts.ROUTING_PREFIX_MAIN)
        .get(middlewares.acl.view, function(req, res, next) {
            return descriptorsSearchController.search(req, res, next);
        });
};
