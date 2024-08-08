'use strict';

var should = require('should'),
    mongoose = require('mongoose'),
    async = require('async'),
    LrsModel = mongoose.model('Lrs'),
    lrsUtils = require('../../utils/lrs.utils'),
    lrs,
    lrs2,
    authHeaderExisting,
    authHeaderNotExisting,
    copy;

describe('Lrs Utils Unit Tests:', function() {

    before(function(done) {

        var hash,
            clearDb,
            loadFixtures;

        copy = LrsModel.schema.callQueue;

        // disable all hooks
        LrsModel.schema.callQueue = [];

        lrs = new LrsModel({
            title: 'test_lrs',
            description: 'Testowy LRS',
            api: {
                basicKey: 'key_1',
                basicSecret: 'secret_1'
            }
        });

        hash = new Buffer(lrs.api.basicKey + ':' + lrs.api.basicSecret).toString('base64');
        authHeaderExisting = 'Basic ' + hash;

        hash = new Buffer('I_DO_NOT' + ':' + 'EXIST').toString('base64');
        authHeaderNotExisting = 'Basic ' + hash;

        lrs2 = new LrsModel({
            title: 'test_lrs_2',
            description: 'Testowy LRS_2',
            api: {
                basicKey: 'key_2',
                basicSecret: 'secret_2'
            }
        });

        clearDb = function(done) {
            LrsModel.remove(done);
        };

        loadFixtures = function(done) {
            async.each([lrs, lrs2], function(item, done) {
                item.save(done);
            }, done);
        };

        async.series([clearDb, loadFixtures], done);

    });

    after(function(done) {
        LrsModel.schema.callQueue = copy;
        LrsModel.remove(done);
    });

    describe('Method assignLrsToRequest', function() {
        it('should exist', function(done) {
            should.exist(lrsUtils.assignLrsToRequest);
            done();
        });

        it('should assign right lrs to req basing on authorization data', function(done) {
            var req = {
                headers: {authorization: authHeaderExisting}
            };

            lrsUtils.assignLrsToRequest(req, {}, function() {
                should.exist(req.lrs);
                req.lrs._id.should.be.eql(lrs._id);
                done();
            });
        });

        it('should assign undefined to req.lrs for not existing LRS', function(done) {
            var req = {
                headers: {authorization: authHeaderNotExisting}
            };

            lrsUtils.assignLrsToRequest(req, {}, function() {
                should.not.exist(req.lrs);
                done();
            });
        });
    });

});
