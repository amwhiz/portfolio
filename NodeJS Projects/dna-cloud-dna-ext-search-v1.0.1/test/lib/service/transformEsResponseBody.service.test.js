'use strict';

var expect = require('chai').expect,
    transformEsResponseBody = require('../../../lib/service/transformEsResponseBody.service');

describe('transformEsResponseBody', function() {
    it('should be a function', function() {
        expect(transformEsResponseBody).to.be.a('function');
    });

    it('should transform elasticsearch response', function() {
        var hit1 = {_source: 'hit 1 source', highlight: 'hit 1 highlight'},
            hit2 = {_source: 'hit 2 source', highlight: 'hit 2 highlight'},
            hit3 = {_source: 'hit 3 source'},
            esResponseBody,
            expected,
            actual,
            total = 123;

        esResponseBody = {
            hits: {
                total: total,
                hits: [hit1, hit2, hit3]
            }
        };

        expected = {
            count: total,
            data: [
                {source: hit1._source, highlight: hit1.highlight},
                {source: hit2._source, highlight: hit2.highlight},
                {source: hit3._source, highlight: hit3.highlight}
            ],
            isAdvanced: true
        };

        actual = transformEsResponseBody(esResponseBody, true);

        expect(actual).to.eql(expected);
    });

    it('should transform elasticsearch response with no hits', function() {
        var transformedEsResponseBody = transformEsResponseBody();

        expect(transformedEsResponseBody).to.have.property('count');
        expect(transformedEsResponseBody).to.have.property('data');
        expect(transformedEsResponseBody).to.have.property('isAdvanced');

        expect(transformedEsResponseBody.count).to.be.equal(0);
        expect(transformedEsResponseBody.isAdvanced).to.false;
    });
});
