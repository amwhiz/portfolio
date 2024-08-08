'use strict';

var express = require('express'),
    consts = require('./consts'),
    _has = require('lodash.has'),
    descriptorsSearchRoute = require('./routes/descriptorsSearch.route');

function plugRoutingIn(mainRouter, middlewares, dnaElasticsearch) {
    var dispatcher = express.Router();

    dispatcher.descriptorsSearchRouter = express.Router();

    mainRouter.use(dispatcher);

    dispatcher.all(consts.ROUTING_PREFIX_MAIN, function(req, res, next) {
        if (_has(req.query, consts.SWITCH_PARAM)) {
            dispatcher.descriptorsSearchRouter.handle(req, res, next);
            return;
        }

        next();
    });

    descriptorsSearchRoute(dispatcher.descriptorsSearchRouter, middlewares, dnaElasticsearch);
}

module.exports = plugRoutingIn;
