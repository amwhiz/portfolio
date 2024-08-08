'use strict';

var plugRoutingIn = require('./lib/plugRoutingIn');

module.exports = {
    load: function(args) {
        plugRoutingIn(args.cloudDnaExpress.router, args.middlewares, args.cloudDnaExpressDnaElasticsearch);
    }
};
