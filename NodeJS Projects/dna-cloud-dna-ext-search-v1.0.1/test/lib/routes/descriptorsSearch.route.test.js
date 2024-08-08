'use strict';

var expect = require('chai').expect,
    sinon = require('sinon'),
    rewire = require('rewire'),
    mocksProto = require('dna-cloud-dna-ext-mocks'),
    _cloneDeep = require('lodash.clonedeep'),
    sharedBehaviours = require('../../sharedBehaviours'),
    Router = require('express').Router,
    DescriptorsSearchController = require('../../../lib/controller/DescriptorsSearchController');

sharedBehaviours.sinonChai();

describe('Descriptors search routing', function() {
    var mocks,
        searchRoute,
        descriptorsSearchController;

    beforeEach(function() {
        searchRoute = rewire('../../../lib/routes/descriptorsSearch.route');
        mocks = _cloneDeep(mocksProto);
        descriptorsSearchController = new DescriptorsSearchController(
            mocks.cloudDnaExpressDnaElasticsearch.Connection.client,
            mocks.cloudDnaExpressDnaElasticsearch.Configuration.config
        );

        searchRoute.__set__('DescriptorsSearchController', sinon.stub().returns(descriptorsSearchController));
    });

    sharedBehaviours.nock();

    it('should be a function', function() {
        expect(searchRoute).to.be.instanceOf(Function);
    });

    it('should add GET route with two middlewares - acl and controller', function() {
        var router = new Router();

        expect(router.stack).to.be.empty.and.instanceOf(Array);
        searchRoute(router, mocks.middlewares, mocks.cloudDnaExpressDnaElasticsearch);
        expect(router.stack).to.have.length(1);
    });

    it('should add acl.view middleware as first', function() {
        var router = new Router(),
            firstMiddleware;

        searchRoute(router, mocks.middlewares, mocks.cloudDnaExpressDnaElasticsearch);

        firstMiddleware = router.stack[0].route.stack[0];

        expect(firstMiddleware).to.be.instanceOf(Object);

        expect(firstMiddleware.method).to.be.equal('get');
        expect(firstMiddleware.handle).to.be.equal(mocks.middlewares.acl.view);
    });

    it('should add descriptorsSearch.controller.search middleware wrapped in closure as second', function() {
        var router = new Router(),
            req = {query: {}, name: 'this-is-req'},
            res = {name: 'this-is-res'},
            next = {name: 'this-is-next'},
            returnValue = {name: 'this-is-returnValue'},
            returnedValue,
            secondMiddleware;

        searchRoute(router, mocks.middlewares, mocks.cloudDnaExpressDnaElasticsearch);
        secondMiddleware = router.stack[0].route.stack[1];
        expect(secondMiddleware).to.be.instanceOf(Object);
        expect(secondMiddleware.method).to.be.equal('get');
        expect(secondMiddleware.handle).to.be.a('function');

        sinon.stub(descriptorsSearchController, 'search').returns(returnValue);
        expect(descriptorsSearchController.search.called).to.be.equal(false);
        returnedValue = secondMiddleware.handle(req, res, next);
        expect(descriptorsSearchController.search.called).to.be.equal(true);
        expect(descriptorsSearchController.search).to.have.been.calledWithExactly(req, res, next);
        expect(returnedValue).to.be.equal(returnValue);
        descriptorsSearchController.search.restore();
    });
});
