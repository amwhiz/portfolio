'use strict';

var expect = require('chai').expect,
    mapHttpQueryFiltersToEsQueryFilter = require('../../../lib/service/mapHttpQueryFiltersToEsQueryFilter.service'),
    httpQueryFilters = require('../../data/httpQueryFilters.json'),
    esQueryFilter = require('../../data/esQueryFilter.json');

describe('mapHttpQueryFiltersToEsQueryFilter', function() {
    it('should be a function', function() {
        expect(mapHttpQueryFiltersToEsQueryFilter).to.be.a('function');
    });

    it.skip('should map http query filters to elasticsearch query filter', function() {
        expect(mapHttpQueryFiltersToEsQueryFilter(httpQueryFilters)).to.eql(esQueryFilter);
    });
});
