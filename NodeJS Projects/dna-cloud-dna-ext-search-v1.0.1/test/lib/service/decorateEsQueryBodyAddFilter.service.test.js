'use strict';

var expect = require('chai').expect,
    rewire = require('rewire'),
    sinon = require('sinon'),
    sharedBehaviours = require('../../sharedBehaviours'),
    decorateEsQueryBodyAddFilter = require('../../../lib/service/decorateEsQueryBodyAddFilter.service');

describe('decorateEsQueryBodyAddFilter', function() {
    sharedBehaviours.sinonChai();

    it('should be a function', function() {
        expect(decorateEsQueryBodyAddFilter).to.be.a('function');
    });

    it('should call mapHttpQueryFiltersToEsQueryFilter service', function() {
        var esQueryBody = {},
            filters = 'hello-this-is-filters',
            mapHttpQueryFiltersToEsQueryFilterSpy = sinon.spy(),
            decorateEsQueryBodyAddFilter = rewire('../../../lib/service/decorateEsQueryBodyAddFilter.service');

        decorateEsQueryBodyAddFilter.__set__('mapHttpQueryFiltersToEsQueryFilter', mapHttpQueryFiltersToEsQueryFilterSpy);

        decorateEsQueryBodyAddFilter(esQueryBody, filters);

        expect(mapHttpQueryFiltersToEsQueryFilterSpy.calledOnce).to.equal(true);
        expect(mapHttpQueryFiltersToEsQueryFilterSpy).to.have.been.calledWithExactly(filters);
    });

    it('should add filter key to esQueryBody', function() {
        var esQueryBody = {};

        decorateEsQueryBodyAddFilter(esQueryBody);

        expect(esQueryBody).to.have.property('filter');
    });
});
