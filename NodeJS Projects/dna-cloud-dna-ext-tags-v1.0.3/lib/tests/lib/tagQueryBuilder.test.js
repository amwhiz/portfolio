'use strict';

var tagQueryBuilder = require('../../lib/tagQueryBuilder'),
    expect = require('chai').expect;

describe('Tag query builder', function() {
    it('should be defined object', function(done) {
        expect(tagQueryBuilder).to.be.a('object');
        done();
    });

    describe('method buildQueryForGet', function() {
        it('should exist', function(done) {
            expect(tagQueryBuilder.buildQueryForGet).to.be.a('function');
            done();
        });

        it('should return empty object for no params', function() {
            var queryString = {},
                expectedResult = {};

            expect(tagQueryBuilder.buildQueryForGet(queryString)).to.deep.equal(expectedResult);
        });

        it('should return tagLabel regex for q param', function() {
            var queryString = {},
                expectedResult = {};

            queryString.q = 'dsa';

            expectedResult.tagLabel = {
                $regex: queryString.q,
                $options: '-i'
            };

            expect(tagQueryBuilder.buildQueryForGet(queryString)).to.deep.equal(expectedResult);
        });

        it('should return no filters for empty filters', function() {
            var queryString = {},
                expectedResult = {};

            queryString.filters = '{}';

            expect(tagQueryBuilder.buildQueryForGet(queryString)).to.deep.equal(expectedResult);
        });

        it('should return tagTypeId for filters with tagTypeId', function() {
            var queryString = {},
                expectedResult = {};

            queryString.filters = '{"tagTypeId": "SKL"}';

            expectedResult.tagTypeId = {$in: 'SKL'};

            expect(tagQueryBuilder.buildQueryForGet(queryString)).to.deep.equal(expectedResult);
        });
    });
});
