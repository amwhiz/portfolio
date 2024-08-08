'use strict';

var express = require('express'),
    consts = require('./consts'),
    _ = require('lodash'),
    endpoints = [
        consts.ROUTING_PREFIX_TAG_TYPES,
        consts.ROUTING_PREFIX_TAG_TYPES_WITH_PARAM,
        consts.ROUTING_PREFIX_TAGS,
        consts.ROUTING_PREFIX_TAGS_WITH_PARAM
    ];

function plugRoutingIn(mainRouter, middlewares) {
    var dispatcherRouter = express.Router(),
        extensionRouter = express.Router();

    mainRouter.use(dispatcherRouter);

    _.forEach(endpoints, function(endpoint) {
        dispatcherRouter.all(endpoint, function(req, res, next) {
            if (_.has(req.query, consts.SWITCH_PARAM)) {
                extensionRouter.handle(req, res, next);
                return;
            }
            next();
        });
    });

    require('./routes/tagType.route')(extensionRouter, middlewares);
    require('./routes/tag.route')(extensionRouter, middlewares);
}

module.exports = plugRoutingIn;