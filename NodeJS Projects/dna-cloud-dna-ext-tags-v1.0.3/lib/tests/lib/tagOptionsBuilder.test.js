'use strict';

var tagOptionsBuilder = require('../../lib/tagOptionsBuilder'),
    expect = require('chai').expect;

describe('Tag options builder', function() {
    it('should be defined object', function(done) {
        expect(tagOptionsBuilder).to.be.a('object');
        done();
    });

    describe('method buildOptionsForGet', function() {
        it('should exist', function(done) {
            expect(tagOptionsBuilder.buildOptionsForGet).to.be.a('function');
            done();
        });

        it('should return sort option if there is no more parameters', function() {
            var options,
                queryString;

            options = {
                sort: {
                    tagLabel: 1
                }
            };

            queryString = {};

            expect(tagOptionsBuilder.buildOptionsForGet(queryString)).to.deep.equal(options);
        });

        it('should return limit option if there is limit param', function() {
            var options,
                queryString;

            options = {
                sort: {
                    tagLabel: 1
                },
                limit: 1
            };

            queryString = {
                limit: 1
            };

            expect(tagOptionsBuilder.buildOptionsForGet(queryString)).to.deep.equal(options);
        });

        it('should return skip option if there is offset param', function() {
            var options,
                queryString;

            options = {
                sort: {
                    tagLabel: 1
                },
                skip: 1
            };

            queryString = {
                offset: 1
            };

            expect(tagOptionsBuilder.buildOptionsForGet(queryString)).to.deep.equal(options);
        });
    });
});
