'use strict';

var expect = require('chai').expect,
    sinon = require('sinon'),
    mocksProto = require('dna-cloud-dna-ext-mocks'),
    httpMocks = require('node-mocks-http'),
    sharedBehaviours = require('../../sharedBehaviours'),
    DescriptorsSearchController = require('../../../lib/controller/DescriptorsSearchController'),
    Bluebird = require('bluebird');

describe('Descriptors search controller', function() {
    var descriptorsSearchController,
        elasticsearchClient = mocksProto.cloudDnaExpressDnaElasticsearch.Connection.client,
        elasticsearchConfiguration = mocksProto.cloudDnaExpressDnaElasticsearch.Configuration.config;

    sharedBehaviours.nockRec();
    sharedBehaviours.sinonChai();

    beforeEach(function() {
        descriptorsSearchController = new DescriptorsSearchController(elasticsearchClient, elasticsearchConfiguration);
    });

    it('should be an object', function() {
        expect(descriptorsSearchController).to.be.instanceOf(Object);
    });

    describe('search', function() {
        var request,
            response,
            next;

        beforeEach(function() {
            request = httpMocks.createRequest();
            response = httpMocks.createResponse();
            next = sinon.spy();
        });

        it('should be a function', function() {
            expect(descriptorsSearchController.search).to.be.instanceOf(Function);
        });

        it('should call handleSearchRequestQueryBuilder.handle', function(done) {
            sinon.stub(descriptorsSearchController, 'handleSearchRequestQuery').returns(Bluebird.resolve());
            descriptorsSearchController.search(request, response);
            expect(descriptorsSearchController.handleSearchRequestQuery.called).to.be.equal(true);
            expect(descriptorsSearchController.handleSearchRequestQuery).to.have.been.calledWithExactly(request.query);
            descriptorsSearchController.handleSearchRequestQuery.restore();
            done();
        });

        it('should next with Error if error occurs', function(done) {
            var error = new Error('Hello this is error');

            sinon.stub(descriptorsSearchController, 'handleSearchRequestQuery', function() {
                return Bluebird.reject(error);
            });

            descriptorsSearchController
                .search(request, response, next)
                .finally(function() {
                    expect(next.calledOnce).to.equal(true);
                    expect(next).to.have.been.calledWithExactly(error);
                    descriptorsSearchController.handleSearchRequestQuery.restore();
                    done();
                });
        });

        it('should next with Error if exception is thrown', function(done) {
            var error = new Error('Hello this is error');

            sinon.stub(descriptorsSearchController, 'handleSearchRequestQuery', function() {
                return Bluebird.resolve().then(sinon.stub().throws(error));
            });

            descriptorsSearchController
                .search(request, response, next)
                .finally(function() {
                    expect(next.calledOnce).to.equal(true);
                    expect(next).to.have.been.calledWithExactly(error);
                    descriptorsSearchController.handleSearchRequestQuery.restore();
                    done();
                });
        });
    });
});
