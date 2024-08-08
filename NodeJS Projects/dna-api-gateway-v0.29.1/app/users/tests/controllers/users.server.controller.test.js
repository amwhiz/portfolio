'use strict';

var usersController = require('../../controllers/users.server.controller.js'),
    chai = require('chai'),
    sinonChai = require('sinon-chai'),
    sinon = require('sinon'),
    expect = chai.expect,
    httpMocks = require('node-mocks-http'),
    passport = require('passport');

chai.use(sinonChai);

describe('Controller', function() {
    describe('Users', function() {
        it('should exist', function(done) {
            expect(usersController).to.be.instanceOf(Object);
            done();
        });

        describe('method', function() {
            describe('signin', function() {
                var passportAuthenticateBak;

                beforeEach(function() {
                    passportAuthenticateBak = passport.authenticate;
                });

                afterEach(function() {
                    passport.authenticate = passportAuthenticateBak;
                });

                it('should exist and be a function', function(done) {
                    expect(usersController.signin).to.be.instanceOf(Function);
                    done();
                });

                it('should call passport.authenticate with \'local\'', function(done) {
                    var req = httpMocks.createRequest(),
                        res = httpMocks.createResponse(),
                        cb = sinon.spy();

                    sinon.spy(passport, 'authenticate');

                    usersController.signin(req, res, cb);

                    expect(passport.authenticate).to.have.callCount(1);
                    expect(passport.authenticate).to.have.been.calledWith('local');

                    passport.authenticate.restore();
                    done();
                });

                it('should send HTTP 400 if error occurs', function(done) {
                    var req = httpMocks.createRequest(),
                        res = httpMocks.createResponse(),
                        next = sinon.spy(),
                        errorToSend = {message: 'I am the error'},
                        infoToSend = {info: 'I am the info'};

                    passport.authenticate = function(name, cb) {
                        cb(errorToSend, {}, infoToSend);
                        return sinon.spy();
                    };

                    res.send = function(data) {
                        expect(data).to.equal(errorToSend);
                        expect(res.statusCode).to.equal(400);
                        done();
                    };

                    usersController.signin(req, res, next);
                });

                it('should send HTTP 400 if there is no user', function(done) {
                    var req = httpMocks.createRequest(),
                        res = httpMocks.createResponse(),
                        next = sinon.spy(),
                        infoToSend = {info: 'I am the info'};

                    passport.authenticate = function(name, cb) {
                        cb(null, undefined, infoToSend);
                        return sinon.spy();
                    };

                    res.send = function(data) {
                        expect(data).to.equal(infoToSend);
                        expect(res.statusCode).to.equal(400);
                        done();
                    };

                    usersController.signin(req, res, next);
                });

                it('should call request.login if user exists and there is no error', function(done) {
                    var req = httpMocks.createRequest(),
                        res = httpMocks.createResponse(),
                        next = sinon.spy(),
                        user = {name: 'john'},
                        infoToSend = {info: 'I am the info'};

                    passport.authenticate = function(name, cb) {
                        cb(null, user, infoToSend);
                        return sinon.spy();
                    };

                    req.login = sinon.spy(function(usr) {
                        expect(usr).to.be.equal(user);
                        done();
                    });

                    usersController.signin(req, res, next);
                });

                it('should send HTTP 400 with error if login fails', function(done) {
                    var req = httpMocks.createRequest(),
                        res = httpMocks.createResponse(),
                        next = sinon.spy(),
                        expectedError = {message: 'I am the error'};

                    passport.authenticate = function(name, cb) {
                        cb(null, {}, {});
                        return sinon.spy();
                    };

                    req.login = function(usr, cb) {
                        cb(expectedError);
                    };

                    res.send = function(err) {
                        expect(err).to.be.equal(expectedError);
                        expect(res.statusCode).to.be.equal(400);
                        done();
                    };

                    usersController.signin(req, res, next);
                });

                it('should jsonp user is login is ok', function(done) {
                    var req = httpMocks.createRequest(),
                        res = httpMocks.createResponse(),
                        next = sinon.spy();

                    passport.authenticate = function(name, cb) {
                        cb(null, {userStatus: 'I\'m a teapot'}, {});
                        return sinon.spy();
                    };

                    req.login = function(receivedUser, cb) {
                        res.jsonp = function(user) {
                            expect(user.user.userStatus).to.be.equal(receivedUser.userStatus);
                            done();
                        };
                        cb();
                    };

                    usersController.signin(req, res, next);
                });
            });

            describe('signout', function() {
                it('should exist and be a function', function(done) {
                    expect(usersController.signout).to.be.instanceOf(Function);
                    done();
                });

                it('should call request.logout() and redirect to /', function(done) {
                    var req = httpMocks.createRequest(),
                        res = httpMocks.createResponse();

                    req.logout = sinon.spy();
                    sinon.spy(res, 'redirect');

                    usersController.signout(req, res);

                    expect(req.logout).to.have.callCount(1);
                    expect(req.logout).to.have.been.calledWithExactly();

                    expect(res.redirect).to.have.callCount(1);
                    expect(res.redirect).to.have.been.calledWithExactly('/');

                    done();
                });
            });

            describe('user', function() {
                it('should exist and be a function', function(done) {
                    expect(usersController.user).to.be.instanceOf(Function);
                    done();
                });

                it('should return a jsonp response with hardened user data', function(done) {
                    var req = httpMocks.createRequest(),
                        res = httpMocks.createResponse(),
                        hardenedUser;

                    hardenedUser = {
                        user: {
                            name: 'John'
                        }
                    };

                    req.user = {
                        userId: 123,
                        accessToken: 'accessToken',
                        refreshToken: 'refreshToken',
                        name: 'John'
                    };

                    res.jsonp = sinon.spy();

                    usersController.user(req, res);
                    expect(res.jsonp).to.have.been.calledWith(hardenedUser);
                    done();
                });
            });
        });
    });
});
