'use strict';

var should = require('should'),
    mongoose = require('mongoose'),
    LrsModel = mongoose.model('Lrs'),
    lrs,
    lrs2;

describe('Lrs Model Unit Tests:', function() {

    before(function(done) {
        lrs = new LrsModel({
            title: 'test_lrs',
            description: 'Testowy LRS'
        });

        lrs2 = new LrsModel({
            title: 'test_lrs',
            description: 'Testowy LRS_2'
        });

        done();
    });

    describe('Method Save', function() {
        it('should be able to save without problems', function(done) {
            return lrs.save(function(err) {
                should.not.exist(err);
                done();
            });
        });

        it('should show error if title is not unique', function(done) {
            return lrs2.save(function(err) {
                should.exist(err);
                done();
            });
        });
    });

    after(function(done) {
        LrsModel.remove(done);
    });

});
