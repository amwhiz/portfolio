'use strict';

var _ = require('lodash'),
    upc = require('./services/upc.service');

exports.search = function(req, res, next) {
    if (req.query.upc_code) {
        var code = req.query.upc_code;
        if (code.length >= 12 && code.length <= 13) {
            return upc.generate(req, res, req.query.upc_code, req.query.count)
                .then(function(codes) {
                    if (typeof res.json !== 'undefined') {
                        res.jsonp(codes);
                    } else {
                        return codes;
                    }
                });
        } else {
            res.render('search', {error: true});
        }
    } else {
        res.render('search');
    }
};

exports.home = function(req, res, next) {
    res.render('index');
};

exports.template = function(req, res, next) {
    res.render('results');
};
