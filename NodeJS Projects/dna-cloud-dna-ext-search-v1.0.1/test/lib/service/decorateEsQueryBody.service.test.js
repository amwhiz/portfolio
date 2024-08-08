'use strict';

var sinon = require('sinon'),
    expect = require('chai').expect,
    decorateEsQueryBody = require('../../../lib/service/decorateEsQueryBody.service'),
    rewire = require('rewire'),
    sharedBehaviours = require('../../sharedBehaviours');

describe('decorateEsQueryBodyAddQuery', function() {
    sharedBehaviours.sinonChai();

    it('should be a function', function() {
        expect(decorateEsQueryBody).to.be.a('function');
    });

    it('should call decorators', function() {
        var decorateEsQueryBody = rewire('../../../lib/service/decorateEsQueryBody.service'),
            decorateEsQueryBodyAddFilterSpy = sinon.spy(),
            decorateEsQueryBodyAddHighlightSpy = sinon.spy(),
            decorateEsQueryBodyAddLimitOffsetSpy = sinon.spy(),
            decorateEsQueryBodyAddQuerySpy = sinon.spy(),
            decorateEsQueryBodyAddSortSpy = sinon.spy(),
            esQueryBody = 'hello-this-is-esQueryBody',
            q = 'hello-this-is-q',
            limit = 'hello-this-is-limit',
            offset = 'hello-this-is-offset',
            sortBy = {name: 'hello-this-is-sortBy'},
            httpQuery,
            filters = 'hello-this-is-filters';

        httpQuery = {
            q: q,
            limit: limit,
            offset: offset
        };

        decorateEsQueryBody.__set__('decorateEsQueryBodyAddFilter', decorateEsQueryBodyAddFilterSpy);
        decorateEsQueryBody.__set__('decorateEsQueryBodyAddHighlight', decorateEsQueryBodyAddHighlightSpy);
        decorateEsQueryBody.__set__('decorateEsQueryBodyAddLimitOffset', decorateEsQueryBodyAddLimitOffsetSpy);
        decorateEsQueryBody.__set__('decorateEsQueryBodyAddQuery', decorateEsQueryBodyAddQuerySpy);
        decorateEsQueryBody.__set__('decorateEsQueryBodyAddSort', decorateEsQueryBodyAddSortSpy);

        decorateEsQueryBody(esQueryBody, httpQuery, filters, sortBy);

        expect(decorateEsQueryBodyAddFilterSpy.calledOnce).to.be.equal(true);
        expect(decorateEsQueryBodyAddFilterSpy).to.have.been.calledWithExactly(esQueryBody, filters);

        expect(decorateEsQueryBodyAddHighlightSpy.calledOnce).to.be.equal(true);
        expect(decorateEsQueryBodyAddHighlightSpy).to.have.been.calledWithExactly(esQueryBody);

        expect(decorateEsQueryBodyAddLimitOffsetSpy.calledOnce).to.be.equal(true);
        expect(decorateEsQueryBodyAddLimitOffsetSpy).to.have.been.calledWithExactly(esQueryBody, httpQuery.limit, httpQuery.offset);

        expect(decorateEsQueryBodyAddQuerySpy.calledOnce).to.be.equal(true);
        expect(decorateEsQueryBodyAddQuerySpy).to.have.been.calledWithExactly(esQueryBody, httpQuery.q);

        expect(decorateEsQueryBodyAddSortSpy.calledOnce).to.be.equal(true);
        expect(decorateEsQueryBodyAddSortSpy).to.have.been.calledWithExactly(esQueryBody, sortBy);
    });
});
