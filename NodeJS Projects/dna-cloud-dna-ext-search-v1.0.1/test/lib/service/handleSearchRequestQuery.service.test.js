'use strict';

var sinon = require('sinon'),
    Bluebird = require('bluebird'),
    rewire = require('rewire'),
    expect = require('chai').expect,
    sharedBehaviours = require('../../sharedBehaviours');

describe('handleSearchRequestQuery', function() {
    var handleSearchRequestQueryBuilder,
        handleSearchRequestQuery,
        buildEsQueryBuilderStub,
        buildEsQueryStub,
        elasticsearchClientMock,
        elasticsearchConfigurationMock;

    sharedBehaviours.sinonChai();

    beforeEach(function() {
        handleSearchRequestQueryBuilder = rewire('../../../lib/service/handleSearchRequestQuery.service.builder.js');

        buildEsQueryStub = sinon.stub().returns('this-is-built-query-stub');
        buildEsQueryBuilderStub = sinon.stub().returns(buildEsQueryStub);
        handleSearchRequestQueryBuilder.__set__('buildEsQueryBuilder', buildEsQueryBuilderStub);

        elasticsearchClientMock = {search: sinon.stub().returns(Bluebird.resolve())};
        elasticsearchConfigurationMock = {};

        handleSearchRequestQuery = handleSearchRequestQueryBuilder(elasticsearchClientMock, elasticsearchConfigurationMock);
    });

    it('should be a function', function() {
        expect(handleSearchRequestQuery).to.be.a('function');
    });

    it('should call buildEsQueryBuilderMock at creation', function() {
        expect(buildEsQueryBuilderStub).to.have.been.calledWithExactly(elasticsearchConfigurationMock);
    });

    it('should call elasticsearchClient.search and buildEsQuery', function(done) {
        var q = 'hello-this-is-q',
            filters = ['hello-this-is-filters'],
            sortBy = ['hello-this-is-sortBy'],
            filtersParsed = ['hello-this-is-filtersParsed'],
            sortByParsed = ['hello-this-is-sortByParsed'],
            query = {q: q, filters: filters, sortBy: sortBy},
            jsonPromiseStub,
            jsonPromiseParseStub;

        jsonPromiseParseStub = sinon.stub();
        jsonPromiseParseStub.withArgs(query.filters).returns(filtersParsed);
        jsonPromiseParseStub.withArgs(query.sortBy).returns(sortByParsed);

        jsonPromiseStub = {
            parse: jsonPromiseParseStub
        };

        handleSearchRequestQueryBuilder.__set__('jsonPromise', jsonPromiseStub);
        handleSearchRequestQuery = handleSearchRequestQueryBuilder(elasticsearchClientMock, elasticsearchConfigurationMock);

        handleSearchRequestQuery(query)
            .then(function() {
                expect(elasticsearchClientMock.search.calledOnce).to.equal(true);
                expect(buildEsQueryStub.calledOnce).to.equal(true);
                expect(buildEsQueryStub).to.have.been.calledWithExactly(query, filtersParsed, sortByParsed);
                expect(elasticsearchClientMock.search).to.have.been.calledWithExactly(buildEsQueryStub.getCalls()[0].returnValue);
            })
            .done(done);
    });
});
