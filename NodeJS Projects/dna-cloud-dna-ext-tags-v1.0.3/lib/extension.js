'use strict';

var initialize,
    initializeRouter,
    initializeModels,
    path = require('path'),
    modelsPath = __dirname + '/models/*',
    db = require('./lib/dbStorage'),
    plugRoutingIn = require('./plugRoutingIn');

initialize = function(params) {
    db.setDb(params.cloudDnaDb);
    initializeModels(params.cloudDnaConfig);
    initializeRouter(params.cloudDnaExpress.router, params.middlewares);
};

initializeRouter = function(router, middlewares) {
    plugRoutingIn(router, middlewares);
};

initializeModels = function(config) {
    config.getGlobbedFiles(modelsPath).forEach(function(modelPath) {
        require(path.resolve(modelPath));
    });
};

module.exports = {
    load: function(params) {
        initialize(params);
    }
};
