'use strict';

var _ = require('lodash'),
    chai = require('chai'),
    expect = chai.expect,
    testConfiguration = require('../data/config'),
    configValidator = require('../../lib/configValidator');

describe('Config validator', function() {
    var configuration;

    before(function() {
        configuration = _.cloneDeep(testConfiguration);
    });

    it('should exist', function(done) {
        expect(configValidator).to.exist();
        done();
    });

    describe('method', function() {
        describe('getErrors', function() {
            it('should exist and be a function', function(done) {
                expect(configValidator.getErrors).to.exist();
                expect(configValidator.getErrors).to.be.instanceOf(Function);
                done();
            });

            it('should return empty array for valid configuration', function(done) {
                var errors = configValidator.getErrors(configuration);

                expect(errors).to.be.instanceOf(Array);
                expect(errors).to.be.empty();

                done();
            });
        });
    });
});
