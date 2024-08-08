'use strict';

var sinon = require('sinon'),
    Bluebird = require('bluebird'),
    rewire = require('rewire'),
    expect = require('chai').expect,
    sharedBehaviours = require('../../sharedBehaviours');

describe('buildEsQuery', function() {
    var buildEsQueryBuilder,
        buildEsQuery,
        decorateEsQueryBodySpy,
        elasticsearchConfigurationMock;

    sharedBehaviours.sinonChai();

    beforeEach(function() {
        buildEsQueryBuilder = rewire('../../../lib/service/buildEsQuery.service.builder');

        decorateEsQueryBodySpy = sinon.spy();
        buildEsQueryBuilder.__set__('decorateEsQueryBody', decorateEsQueryBodySpy);

        elasticsearchConfigurationMock = {index: 'hello-this-is-elasticsearch-configuration-index-mock'};
        buildEsQuery = buildEsQueryBuilder(elasticsearchConfigurationMock);
    });

    it('should be a function', function() {
        expect(buildEsQuery).to.be.a('function');
    });

    it('should return elasticsearch query', function() {
        var actual = buildEsQuery(),
            expected;

        expected = {
            index: elasticsearchConfigurationMock.index,
            type: 'descriptor',
            lowercaseExpandedTerms: true,
            body: {}
        };

        expect(actual).to.eql(expected);
    });

    it('should call decorateEsQueryBody with query.body, q and filters', function() {
        var query = ['hello=this-is-query'],
            filters = ['hello=this-is-filters'],
            sortBy = ['hello=this-is-sortBy'],
            esQuery = buildEsQuery(query, filters, sortBy);

        expect(decorateEsQueryBodySpy.calledOnce).to.equal(true);
        expect(decorateEsQueryBodySpy).to.have.been.calledWithExactly(esQuery.body, query, filters, sortBy);
    });
});
