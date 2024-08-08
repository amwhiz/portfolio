'use strict';

var securityMiddleware = require('../../lib/security.server.middleware.lib.js'),
    chai = require('chai'),
    sinonChai = require('sinon-chai'),
    sinon = require('sinon'),
    expect = chai.expect,
    httpMocks = require('node-mocks-http'),
    config = require('../../../../config/config');

chai.use(sinonChai);

describe('Security middleware', function() {
    it('should exist', function(done) {
        expect(securityMiddleware).to.be.instanceOf(Object);
        done();
    });

    describe('method', function() {
        var request,
            response;

        beforeEach(function() {
            request = httpMocks.createRequest();
            response = httpMocks.createResponse();
        });

        describe('checkAuthentication', function() {
            var configAppPublicResourcesBackup;

            beforeEach(function() {
                configAppPublicResourcesBackup = config.app.publicResources;
            });

            afterEach(function() {
                config.app.publicResources = configAppPublicResourcesBackup;
            });

            it('should exist and be a function', function(done) {
                expect(securityMiddleware.checkAuthentication).to.be.instanceOf(Function);
                done();
            });

            it('should next() if user is authenticated', function(done) {
                var next = sinon.spy();

                request.isAuthenticated = sinon.stub().returns(true);

                securityMiddleware.checkAuthentication(request, response, next);

                expect(next).to.have.callCount(1);
                expect(next).to.have.been.calledWithExactly();

                done();
            });

            it('should next() if user is not authenticated but public url is requested', function(done) {
                var next = sinon.spy(),
                    publicUrl = '/this/is/public/url';

                config.app.publicResources = [publicUrl];
                request.isAuthenticated = sinon.stub().returns(false);
                request.url = publicUrl;

                securityMiddleware.checkAuthentication(request, response, next);

                expect(next).to.have.callCount(1);
                expect(next).to.have.been.calledWithExactly();

                done();
            });

            it('should send HTTP 401 if neither user is authenticated nor requested url is public', function(done) {
                var next = sinon.spy(),
                    url = 'some/url',
                    originalUrl = 'original/url',
                    expectedData;

                config.app.publicResources = [];
                request.isAuthenticated = sinon.stub().returns(false);
                request.url = url;
                request.originalUrl = originalUrl;
                expectedData = {
                    url: originalUrl,
                    message: 'Unauthorized',
                    status: 401
                };

                response.jsonp = function(data) {
                    expect(data).to.be.eql(expectedData);
                    expect(response.statusCode).to.be.equal(401);
                    done();
                };

                securityMiddleware.checkAuthentication(request, response, next);
            });
        });
    });
});
