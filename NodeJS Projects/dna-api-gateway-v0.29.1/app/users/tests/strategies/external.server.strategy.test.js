'use strict';

var rewire = require('rewire'),
    chai = require('chai'),
    sinon = require('sinon'),
    expect = chai.expect,
    externalStrategy = rewire('../../strategies/external.server.strategy.js'),
    userApiClientMock = {},
    LocalStrategyMock,
    passportMock,
    user = 'username',
    password = 'password',
    callbackToTest,
    expectedResult;

function setupUserApiClientMockPromise() {
    userApiClientMock.done = function() {
        return userApiClientMock;
    };

    userApiClientMock.error = function() {
        return userApiClientMock;
    };

    userApiClientMock.catch = function() {
        return userApiClientMock;
    };
}

function setMocks() {
    LocalStrategyMock = function(userFieldsNames, cb) {
        callbackToTest = cb;
    };

    passportMock = {};

    passportMock.use = function(strategy) {
    };

    externalStrategy.__set__({
        passport: passportMock,
        LocalStrategy: LocalStrategyMock,
        userApiClient: userApiClientMock
    });
}

function setResponseForMethod(methodName, response) {
    userApiClientMock[methodName] = function(callback) {
        callback(response);

        return userApiClientMock;
    };
}

describe('External Strategy', function() {
    beforeEach(function() {
        setupUserApiClientMockPromise();
        setMocks();
        userApiClientMock.authenticate = sinon
            .stub()
            .returns(userApiClientMock);
    });

    describe('passport.use', function() {
        it('should be called with proper arguments', function() {
            var passportSpy = sinon.spy(passportMock, 'use');

            externalStrategy();
            expect(passportSpy).to.have.been.calledWith(new LocalStrategyMock());
        });
    });

    describe('strategy', function() {
        it('should be called with proper arguments', function() {
            var spy,
                userObj;

            userObj = {
                usernameField: user,
                passwordField: password
            };

            spy = sinon.spy(LocalStrategyMock);
            externalStrategy.__set__({
                LocalStrategy: spy
            });
            externalStrategy();
            expect(spy).to.have.been.calledWith(userObj, callbackToTest);
        });
    });

    describe('dependency', function() {
        describe('userApiClient', function() {
            it('should be called', function() {
                callbackToTest(user, password, function() {
                });
                expect(userApiClientMock.authenticate).to.have.been.calledWith(user, password);
            });

            describe('method', function() {
                describe('error', function() {
                    beforeEach(function() {
                        setupUserApiClientMockPromise();
                    });

                    it('should return error message in response', function() {
                        var response = 'Error message';

                        setResponseForMethod('error', response);

                        callbackToTest(user, password, function(err, valid, info) {
                            expect(valid).to.be.equal(false);
                            expect(err.message).to.be.equal(response);
                        });
                    });

                    it('should return error message in response message', function() {
                        var response = {
                            message: 'Error message'
                        };

                        setResponseForMethod('error', response);

                        callbackToTest(user, password, function(err, valid, info) {
                            expect(valid).to.be.equal(false);
                            expect(err).to.have.key('message');
                            expect(err.message).to.be.equal(response.message);
                        });
                    });
                });

                describe('catch', function() {
                    beforeEach(function() {
                        setupUserApiClientMockPromise();
                    });

                    it('should return error message in response', function() {
                        var response = 'Catch message';

                        setResponseForMethod('catch', response);

                        callbackToTest(user, password, function(err, valid, info) {
                            expect(valid).to.be.equal(false);
                            expect(err.message).to.be.equal(response);
                        });
                    });

                    it('should return catch message', function() {
                        var response = {
                            message: 'Error message'
                        };

                        setResponseForMethod('catch', response);

                        callbackToTest(user, password, function(err, valid, info) {
                            expect(valid).to.be.equal(false);
                            expect(err).to.have.key('message');
                            expect(err.message).to.be.equal(response.message);
                        });
                    });
                });

                describe('done', function() {
                    beforeEach(function() {
                        setupUserApiClientMockPromise();
                        expectedResult = null;
                    });

                    it('should return error for bad response', function() {
                        var response = null;

                        setResponseForMethod('done', response);

                        expectedResult = 'Unknown error';

                        callbackToTest(user, password, function(err, valid, info) {
                            expect(info.message).to.be.equal(expectedResult);
                        });
                    });

                    it('should return proper display name', function() {
                        //jscs:disable requireCamelCaseOrUpperCaseIdentifiers
                        var response = {
                            user_details: {
                                profile: {
                                    firstName: 'name',
                                    lastName: 'lastname'
                                }
                            }
                        };

                        setResponseForMethod('done', response);

                        expectedResult = [response.user_details.profile.firstName, response.user_details.profile.lastName].join(' ');
                        //jscs:enable
                        callbackToTest(user, password, function(err, user) {
                            expect(user.displayName).to.be.equal(expectedResult);
                        });
                    });

                    it('should return proper email address', function() {
                        //jscs:disable requireCamelCaseOrUpperCaseIdentifiers
                        var response = {
                            user_details: {
                                profile: {
                                    emails: [
                                        {
                                            emailAddress: 'test@test.com'
                                        },
                                        {
                                            emailAddress: 'test2@test.com'
                                        }
                                    ]
                                }
                            }
                        };

                        setResponseForMethod('done', response);

                        expectedResult = response
                            .user_details
                            .profile
                            .emails
                            .map(function(element) {
                                return element.emailAddress;
                            });
                        //jscs:enable
                        callbackToTest(user, password, function(err, user) {
                            expect(user.emailAddress).to.be.deep.equal(expectedResult);
                        });
                    });

                    it('should return proper roles', function() {
                        //jscs:disable requireCamelCaseOrUpperCaseIdentifiers
                        var response = {
                            user_details: {
                                roles: [
                                    {role: 'edit'},
                                    {role: 'view'}
                                ]
                            }
                        };

                        setResponseForMethod('done', response);

                        expectedResult = response
                            .user_details
                            .roles
                            .map(function(element) {
                                return element.role;
                            });
                        //jscs:enable
                        callbackToTest(user, password, function(err, user) {
                            expect(user.roles).to.be.deep.equal(expectedResult);
                        });
                    });
                });
            });
        });
    });
});
