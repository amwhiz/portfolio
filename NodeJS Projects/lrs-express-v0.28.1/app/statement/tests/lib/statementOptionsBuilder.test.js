'use strict';

var statementOptionsBuilder = require('../../lib/statement-options-builder/statementOptionsBuilder'),
    expect = require('chai').expect;

describe('Statement options builder', function() {
    it('should be defined object', function(done) {
        expect(statementOptionsBuilder).to.be.a('object');
        done();
    });

    describe('method buildOptionsForMultipleGet', function() {
        it('should exist', function(done) {
            expect(statementOptionsBuilder.buildOptionsForMultipleGet).to.be.a('function');
            done();
        });

        it('should return sort option if there is no more parameters', function() {
            var options,
                queryString;

            options = {
                sort: {
                    'statement.stored': -1
                }
            };

            queryString = {};

            expect(statementOptionsBuilder.buildOptionsForMultipleGet(queryString)).to.deep.equal(options);
        });

        it('should return limit option if there is limit param', function() {
            var options,
                queryString;

            options = {
                sort: {
                    'statement.stored': -1
                },
                limit: 1
            };

            queryString = {
                limit: 1
            };

            expect(statementOptionsBuilder.buildOptionsForMultipleGet(queryString)).to.deep.equal(options);
        });

        it('should return sort option with 1 value when there is parameter ascending eqaul true', function() {
            var options,
                queryString;

            options = {
                sort: {
                    'statement.stored': 1
                }
            };

            queryString = {
                ascending: 'true'
            };

            expect(statementOptionsBuilder.buildOptionsForMultipleGet(queryString)).to.deep.equal(options);
        });
    });
});
