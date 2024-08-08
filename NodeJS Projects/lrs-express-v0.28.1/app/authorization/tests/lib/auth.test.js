'use strict';

var should = require('should'),
    auth = require('../../lib/auth'),
    httpDecorator = require('../../../http-decorator/middlewares/http.middleware');

describe('Basic Authorization module', function() {

    var req = {},
        res = {},
        callback = function() {
        };
    req.headers = {};

    res.statusCode = 0;
    res.status = function(status) {
        this.statusCode = status;
        return this;
    };

    it('should return 401 if lrs doesn\'t exist', function(done) {
        res.json = function() {
            res.statusCode.should.equal(401);
            done();
        };
        httpDecorator(req, res, function() {
        });
        auth.basicAuth(req, res, callback);
    });

    it('should return lrs if lrs exist', function(done) {
        req.lrs = {name: 'lrs'};
        httpDecorator(req, res, function() {
        });
        auth.basicAuth(req, res, callback);
        req.lrs.name.should.equal('lrs');
        done();
    });

});
