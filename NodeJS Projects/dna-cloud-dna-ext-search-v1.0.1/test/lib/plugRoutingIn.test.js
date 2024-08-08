'use strict';

var expect = require('chai').expect,
    sinon = require('sinon'),
    _cloneDeep = require('lodash.clonedeep'),
    sharedBehaviours = require('../sharedBehaviours'),
    rewire = require('rewire'),
    express = require('express'),
    httpMocks = require('node-mocks-http'),
    consts = require('../../lib/consts');

describe('plugRoutingIn', function() {
    var plugRoutingIn;

    beforeEach(function() {
        plugRoutingIn = rewire('../../lib/plugRoutingIn');
    });

    sharedBehaviours.nock();
    sharedBehaviours.sinonChai();

    it('should be a function', function() {
        expect(plugRoutingIn).to.be.instanceOf(Function);
    });

    describe('dispatcher router', function() {
        it('should be mount in mainRouter', function() {
            var mainRouter = express.Router(),
                descriptorsSearchRoute = sinon.mock(),
                dispatcherRouter,
                dispatcherRoute,
                dispatcherFunction,
                descriptorsSearchRouter;

            plugRoutingIn.__set__('descriptorsSearchRoute', descriptorsSearchRoute);
            plugRoutingIn(mainRouter);

            expect(mainRouter.stack).to.have.length(1);
            expect(mainRouter.stack[0]).to.have.property('handle');

            dispatcherRouter = mainRouter.stack[0].handle;

            expect(dispatcherRouter).to.have.property('stack');
            expect(dispatcherRouter.stack).to.be.an.instanceOf(Array);
            expect(dispatcherRouter.stack).to.have.length(1);
            expect(dispatcherRouter.stack[0]).to.have.property('route');

            dispatcherRoute = dispatcherRouter.stack[0].route;

            expect(dispatcherRoute).to.have.property('path');
            expect(dispatcherRoute.path).to.be.equal('/descriptors/search/');
            expect(dispatcherRoute).to.have.property('methods');
            expect(dispatcherRoute.methods).to.have.property('_all');
            expect(dispatcherRoute.methods._all).to.be.equal(true);
            expect(dispatcherRoute).to.have.property('stack');
            expect(dispatcherRoute.stack).to.be.an.instanceOf(Array);
            expect(dispatcherRoute.stack).to.have.length(1);
            expect(dispatcherRoute.stack[0]).to.have.property('handle');

            dispatcherFunction = dispatcherRoute.stack[0].handle;

            expect(dispatcherFunction).to.be.an.instanceOf(Function);
            expect(dispatcherRouter).to.have.property('descriptorsSearchRouter');

            descriptorsSearchRouter = dispatcherRouter.descriptorsSearchRouter;

            expect(descriptorsSearchRouter).to.have.property('name');
            expect(descriptorsSearchRouter).to.have.property('handle');
            expect(descriptorsSearchRouter.handle).to.be.an.instanceOf(Function);
            expect(descriptorsSearchRouter.name).to.be.equal('router');
        });

        describe('dispatching function', function() {
            var dispatcherFunction,
                descriptorsSearchRouter,
                request,
                response,
                next;

            beforeEach(function() {
                var mainRouter = express.Router(),
                    descriptorsSearchRoute = sinon.mock(),
                    dispatcherRouter,
                    dispatcherRoute;

                plugRoutingIn.__set__('descriptorsSearchRoute', descriptorsSearchRoute);
                plugRoutingIn(mainRouter);

                dispatcherRouter = mainRouter.stack[0].handle;
                dispatcherRoute = dispatcherRouter.stack[0].route;
                dispatcherFunction = dispatcherRoute.stack[0].handle;

                descriptorsSearchRouter = dispatcherRouter.descriptorsSearchRouter;

                request = httpMocks.createRequest();
                response = httpMocks.createResponse();
                next = sinon.spy();

                sinon.spy(descriptorsSearchRouter, 'handle');
            });

            describe('called with request without SWITCH_PARAM param present in query', function() {
                beforeEach(function() {
                    dispatcherFunction(request, response, next);
                });

                it('should call next()', function() {
                    expect(next.calledOnce).to.equal(true);
                });

                it('should NOT call descriptorsSearchRouter.handle()', function() {
                    expect(descriptorsSearchRouter.handle.called).to.equal(false);
                });
            });

            describe('called with request with SWITCH_PARAM param present in query, where', function() {
                var valuesToTest = [undefined, null, false, 0, '0', '', true, 1, '1', 'someValue', [], {}, [1, 2, 3], {a: 1}];

                function getSuiteForValue(value) {
                    return function() {
                        beforeEach(function() {
                            request.query[consts.SWITCH_PARAM] = value;
                            dispatcherFunction(request, response, next);
                        });

                        it('should NOT call next()', function() {
                            expect(next.called).to.equal(false);
                        });

                        it('should call descriptorsSearchRouter.handle(request, response, next)', function() {
                            expect(descriptorsSearchRouter.handle.calledOnce).to.equal(true);
                            expect(descriptorsSearchRouter.handle).to.have.been.calledWithExactly(request, response, next);
                        });
                    };
                }

                valuesToTest.forEach(function(valueToTest) {
                    describe('SWITCH_PARAM === ' + JSON.stringify(valueToTest), getSuiteForValue(valueToTest));
                });
            });
        });
    });

    it('should call descriptorsSearchRoute', function() {
        var mainRouter = express.Router(),
            middlewares = {},
            elasticsearchClient = {},
            descriptorsSearchRoute = sinon.spy();

        plugRoutingIn.__set__('descriptorsSearchRoute', descriptorsSearchRoute);
        plugRoutingIn(mainRouter, middlewares, elasticsearchClient);

        expect(descriptorsSearchRoute).to.have.been.calledWithExactly(mainRouter.stack[0].handle.descriptorsSearchRouter, middlewares, elasticsearchClient);
    });
});
