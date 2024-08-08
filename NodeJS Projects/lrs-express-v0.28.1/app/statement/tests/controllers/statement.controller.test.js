'use strict';

var should = require('should'),
    httpMocks = require('node-mocks-http'),
    mongoose = require('mongoose'),
    config = require('../../../../config/env/test'),
    StatementModel = mongoose.model('Statement'),
    LrsModel = mongoose.model('Lrs'),
    uuid = require('node-uuid'),
    statementController = require('../../controllers/statement'),
    httpDecorator = require('../../../http-decorator/middlewares/http.middleware'),
    id,
    apiKey,
    lrs,
    next;

describe('Statement controller', function() {
    before(function(done) {
        StatementModel.remove({}, function() {
            lrs = new LrsModel();
            lrs.title = 'test lrs';
            lrs.save(function() {
                apiKey = new Buffer([lrs.api.basicKey, lrs.api.basicSecret].join(':')).toString('base64');
                done();
            });
        });

        next = function() {
        };
    });

    after(function(done) {
        LrsModel.remove(function() {
            StatementModel.remove(done);
        });
    });

    describe('getStatements method', function() {
        it('should exist', function() {
            should.exist(statementController.getStatements);
        });

        it('should return 400 if lrs is improper', function() {
            var response = httpMocks.createResponse(),
                request = httpMocks.createRequest();

            response.json = function() {
                response.statusCode.should.be.eql(400);
            };
            request.lrs = {};
            httpDecorator(request, response, next);
            statementController.getStatements(request, response);
        });

        it('should return 200 and empty collection if lrs is proper', function() {
            var response = httpMocks.createResponse(),
                request = httpMocks.createRequest();

            response.json = function(data) {
                response.statusCode.should.be.eql(200);
                data.should.be.eql([]);
            };
            request.lrs = lrs;
            httpDecorator(request, response, next);
            statementController.getStatements(request, response);
        });

        it('should return 400 if lrs is improper', function() {
            var response = httpMocks.createResponse(),
                request = httpMocks.createRequest();

            response.json = function() {
                response.statusCode.should.be.eql(400);
            };
            request.lrs = {};
            httpDecorator(request, response, next);
            statementController.getStatements(request, response);
        });

        it('should return 404 if lrs is proper and id is specified', function() {
            var response = httpMocks.createResponse(),
                request = httpMocks.createRequest();

            response.json = function() {
                response.statusCode.should.be.eql(404);
            };
            request.lrs = lrs;
            request.query.statementId = 'de305d54-75b4-431b-adb2-eb6b9e546014';
            httpDecorator(request, response, next);
            statementController.getStatements(request, response);
        });

        it('should return 400 when statementId and voidedStatementId params are sent', function() {
            var response = httpMocks.createResponse(),
                request = httpMocks.createRequest();

            response.json = function() {
                response.statusCode.should.be.eql(400);
            };
            request.lrs = lrs;
            request.query.statementId = 'de305d54-75b4-431b-adb2-eb6b9e546014';
            request.query.voidedStatementId = 'be305d54-75b4-431b-adb2-eb6b9e546014';
            httpDecorator(request, response, next);
            statementController.getStatements(request, response);
        });
    });

    describe('createStatements method', function() {
        var validStatement,
            invalidStatement;

        before(function() {
            validStatement = {
                id: uuid.v4(),
                verb: {
                    id: 'http://adlnet.gov/expapi/verbs/created',
                    display: {
                        'en-US': 'created'
                    }
                },
                object: {
                    id: 'http://example.adlnet.gov/xapi/example/activity1',
                    type: 'custom'
                },
                actor: {
                    objectType: 'Agent',
                    account: {
                        homePage: 'http://my.english.com',
                        name: 'pearson userid'
                    }
                },
                authority: {
                    objectType: 'Agent',
                    account: {
                        homePage: 'http://my.english.com',
                        name: 'pearson userid'
                    }
                }
            };
            invalidStatement = {
            };
        });

        it('should exist', function() {
            should.exist(statementController.createStatements);
        });

        it('should return 200 for valid statement', function() {
            var response = httpMocks.createResponse(),
                request = httpMocks.createRequest();

            response.json = function(data) {
                response.statusCode.should.be.eql(200);
                data.should.not.be.empty;
            };
            request.lrs = lrs;
            request.body = validStatement;
            httpDecorator(request, response, next);
            statementController.createStatements(request, response, next);
        });

        it('should return 400 for invalid statement', function() {
            var response = httpMocks.createResponse(),
                request = httpMocks.createRequest();

            response.json = function() {
                response.statusCode.should.be.eql(400);
            };
            request.lrs = lrs;
            request.body = invalidStatement;
            httpDecorator(request, response, next);
            statementController.createStatements(request, response, next);
        });
    });

    describe('createStatement method', function() {
        var validStatement,
            invalidStatement;

        before(function() {
            validStatement = {
                id: uuid.v4(),
                verb: {
                    id: 'http://adlnet.gov/expapi/verbs/created',
                    display: {
                        'en-US': 'created'
                    }
                },
                object: {
                    id: 'http://example.adlnet.gov/xapi/example/activity1',
                    type: 'custom'
                },
                actor: {
                    objectType: 'Agent',
                    account: {
                        homePage: 'http://my.english.com',
                        name: 'pearson userid'
                    }
                },
                authority: {
                    account: {
                        homePage: 'http://my.english.com',
                        name: 'pearson userid'
                    }
                }
            };
            invalidStatement = {
            };
        });

        it('should exist', function() {
            should.exist(statementController.createStatement);
        });

        it('should return 204 for valid statement', function() {
            var response = httpMocks.createResponse(),
                request = httpMocks.createRequest();

            response.json = function(data) {
                response.statusCode.should.be.eql(204);
                data.should.not.be.empty;
            };
            request.lrs = lrs;
            request.body = validStatement;
            httpDecorator(request, response, next);
            statementController.createStatement(request, response, next);
        });

        it('should return 400 for invalid statement', function() {
            var response = httpMocks.createResponse(),
                request = httpMocks.createRequest();

            response.json = function() {
                response.statusCode.should.be.eql(400);
            };
            request.lrs = lrs;
            request.body = invalidStatement;
            httpDecorator(request, response, next);
            statementController.createStatement(request, response, next);
        });
    });
});
