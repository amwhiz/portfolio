'use strict';

var statementParamsValidator = require('../../lib/statement-params-validator/statementParamsValidator'),
    expect = require('chai').expect;

describe('Statement params validator', function() {
    it('should be defined object', function(done) {
        expect(statementParamsValidator).to.be.a('object');
        done();
    });

    describe('method validateIds', function() {
        it('should exist', function(done) {
            expect(statementParamsValidator.validateIds).to.be.a('function');
            done();
        });

        it('should return false when both statementId and voidedStatementId exist', function() {
            var queryString = {
                statementId: 'de305d54-75b4-431b-adb2-eb6b9e546014',
                voidedStatementId: 'be305d54-75b4-431b-adb2-eb6b9e546014'
            };

            expect(statementParamsValidator.validateIds(queryString)).to.equal(false);
        });

        it('should return true when only statementId exists', function() {
            var queryString = {
                statementId: 'de305d54-75b4-431b-adb2-eb6b9e546014'
            };

            expect(statementParamsValidator.validateIds(queryString)).to.equal(true);
        });

        it('should return true when only voidedStatementId exists', function() {
            var queryString = {
                voidedStatementId: 'be305d54-75b4-431b-adb2-eb6b9e546014'
            };

            expect(statementParamsValidator.validateIds(queryString)).to.equal(true);
        });

        it('should return true when there is no id', function() {
            var queryString = {};

            expect(statementParamsValidator.validateIds(queryString)).to.equal(true);
        });
    });
});
