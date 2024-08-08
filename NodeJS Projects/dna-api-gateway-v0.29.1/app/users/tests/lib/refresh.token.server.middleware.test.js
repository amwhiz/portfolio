'use strict';

var rewire = require('rewire'),
    chai = require('chai'),
    sinonChai = require('sinon-chai'),
    sinon = require('sinon'),
    expect = chai.expect,
    refreshTokenMiddleware = rewire('../../lib/refresh.token.server.middleware.lib.js'),
    httpMocks = require('node-mocks-http'),
    tokenDataMock = {},
    userApiClientMock = {},
    refreshTokenMiddlewareSpy,
    err,
    req,
    res,
    next;

chai.use(sinonChai);

function setupUserApiClientMockPromise() {
    userApiClientMock.then = function() {
        return userApiClientMock;
    };

    userApiClientMock.error = function() {
        return userApiClientMock;
    };

    userApiClientMock.catch = function() {
        return userApiClientMock;
    };
}

function setupRefreshTokenMiddleware() {
    refreshTokenMiddleware.__set__({
        userApiClient: userApiClientMock
    });
}

function expectErrorHandled() {
    it('should close the session', function() {
        err.repeater = function() {
        };
        req.logout = sinon.spy();
        refreshTokenMiddleware(err, req, res, next);

        expect(req.logout).to.have.been.calledWith();
    });

    it('should set the status code to 401', function() {
        err.repeater = function() {
        };
        req.logout = sinon.spy();
        refreshTokenMiddleware(err, req, res, next);

        expect(res.statusCode).to.equal(401);
    });
}

describe('Refresh token middleware', function() {
    //jscs:disable
    tokenDataMock.access_token = 'access_token';
    tokenDataMock.refresh_token = 'refresh_token';
    //jscs:enable

    before(function() {
        refreshTokenMiddlewareSpy = sinon.spy(refreshTokenMiddleware);
        setupUserApiClientMockPromise();
        userApiClientMock.refreshToken = sinon
            .stub()
            .returns(userApiClientMock);
    });

    beforeEach(function() {
        err = {};
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        next = function() {
        };

        req.login = function() {
        };
        req.logout = function() {
        };
    });

    afterEach(function() {
        setupUserApiClientMockPromise();
        setupRefreshTokenMiddleware();
    });

    it('should exist', function(done) {
        expect(refreshTokenMiddlewareSpy).to.be.instanceOf(Object);
        done();
    });

    it('should accept proper parameters', function() {
        refreshTokenMiddlewareSpy(err, req, res, next);
        expect(refreshTokenMiddlewareSpy).to.have.been.calledWith(err, req, res, next);
    });

    it('should call next with the err object if err.repeater is not defined', function() {
        next = sinon.spy();

        refreshTokenMiddlewareSpy(err, req, res, next);
        expect(next).to.have.been.calledWith(err);
    });

    it('should call next with the err object if err.repeater is not a valid function', function() {
        next = sinon.spy();
        err.repeater = {};

        refreshTokenMiddlewareSpy(err, req, res, next);
        expect(next).to.have.been.calledWith(err);
    });

    describe('dependency', function() {
        describe('userApiClient', function() {
            it('should be called if err.repeater is a proper function', function() {
                err.repeater = function() {
                };
                req.user = {};

                refreshTokenMiddleware(err, req, res, next);
                expect(userApiClientMock.refreshToken).to.have.been.calledWith(req.user);
            });

            describe('method', function() {
                describe('then', function() {
                    beforeEach(function() {
                        userApiClientMock.then = function(callback) {
                            callback(tokenDataMock);

                            return userApiClientMock;
                        };

                        setupRefreshTokenMiddleware();
                    });

                    it('should set proper req.user properties', function() {
                        err.repeater = function() {
                        };
                        req.user = {};

                        refreshTokenMiddleware(err, req, res, next);
                        //jscs:disable
                        expect(req.user.accessToken).to.be.equal(tokenDataMock.access_token);
                        expect(req.user.refreshToken).to.be.equal(tokenDataMock.refresh_token);
                        //jscs:enable
                    });

                    it('should call req.login with proper user data', function() {
                        err.repeater = function() {
                        };
                        req.user = {};
                        req.login = sinon.spy();

                        refreshTokenMiddleware(err, req, res, next);
                        expect(req.login).to.have.been.calledWith(req.user);
                    });

                    describe('callback', function() {
                        describe('req.login', function() {
                            it('should call next with error information when an error occurs', function() {
                                var loginError = {};

                                next = sinon.spy();
                                err.repeater = function() {
                                };
                                req.user = {};
                                req.login = function(user, callback) {
                                    callback(loginError);
                                };

                                refreshTokenMiddleware(err, req, res, next);
                                expect(next).to.have.been.calledWith(loginError);
                            });

                            it('should call err.repeater when login no error occurs', function() {
                                err.repeater = sinon
                                    .stub()
                                    .returns({
                                        error: function() {
                                            return {
                                                catch: function() {
                                                }
                                            };
                                        }
                                    });
                                req.user = {};
                                req.login = function(user, callback) {
                                    callback();
                                };

                                refreshTokenMiddleware(err, req, res, next);
                                expect(err.repeater).to.have.been.calledWith(req, res);
                            });

                            describe('callback', function() {
                                describe('err.repeater', function() {
                                    it('should be able to run proper error handler', function() {
                                        var apiError = {};

                                        next = sinon.spy();
                                        err.repeater = sinon
                                            .stub()
                                            .returns({
                                                error: function(callback) {
                                                    callback(apiError);
                                                    return {
                                                        catch: function() {
                                                        }
                                                    };
                                                }
                                            });
                                        req.user = {};
                                        req.login = function(user, callback) {
                                            callback();
                                        };

                                        refreshTokenMiddleware(err, req, res, next);
                                        expect(next).to.have.been.calledWith(apiError);
                                    });

                                    it('should be able to run proper catch handler', function() {
                                        var apiError = {};

                                        next = sinon.spy();
                                        err.repeater = sinon
                                            .stub()
                                            .returns({
                                                error: function() {
                                                    return {
                                                        catch: function(callback) {
                                                            callback(apiError);
                                                        }
                                                    };
                                                }
                                            });
                                        req.user = {};
                                        req.login = function(user, callback) {
                                            callback();
                                        };

                                        refreshTokenMiddleware(err, req, res, next);
                                        expect(next).to.have.been.calledWith(apiError);
                                    });
                                });
                            });
                        });
                    });
                });

                describe('error', function() {
                    beforeEach(function() {
                        userApiClientMock.error = function(callback) {
                            callback(err, req, res);
                            return userApiClientMock;
                        };

                        setupRefreshTokenMiddleware();
                    });

                    expectErrorHandled();
                });

                describe('catch', function() {
                    beforeEach(function() {
                        userApiClientMock.catch = function(callback) {
                            callback(err, req, res);
                            return userApiClientMock;
                        };

                        setupRefreshTokenMiddleware();
                    });

                    expectErrorHandled();
                });
            });
        });
    });
});
