'use strict';

var should = require('should'),
    httpMocks = require('node-mocks-http'),
    mongoose = require('mongoose'),
    config = require('../../../../config/env/test'),
    DocumentModel = mongoose.model('Document'),
    LrsModel = mongoose.model('Lrs'),
    uuid = require('node-uuid'),
    stateController = require('../../controllers/state'),
    httpDecorator = require('../../../http-decorator/middlewares/http.middleware'),
    id,
    apiKey,
    lrs,
    request,
    response;

describe('Unit tests', function() {
    describe('State controller', function() {
        before(function(done) {
            DocumentModel.remove({}, function() {
                lrs = new LrsModel();
                lrs.title = 'test lrs';
                lrs.save(function() {
                    apiKey = new Buffer([lrs.api.basicKey, lrs.api.basicSecret].join(':')).toString('base64');
                    done();
                });
            });
        });

        beforeEach(function(done) {
            // mock request, response and decorator
            response = httpMocks.createResponse();
            request = httpMocks.createRequest();
            httpDecorator(request, response, function() {
                done();
            });
        });

        after(function(done) {
            LrsModel.remove(function() {
                DocumentModel.remove(done);
            });
        });

        describe('getStates method', function() {
            it('should exist', function(done) {
                should.exist(stateController.getStates);
                done();
            });

            it('should return 400 if lrs is improper', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(400);
                    done();
                };

                request.lrs = {};

                stateController.getStates(request, response);
            });

            it('should return 400 if lrs is not defined', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(400);
                    done();
                };

                stateController.getStates(request, response);
            });

            it('should return 400 if lrs is proper, but there is no params', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(400);
                    done();
                };

                request.lrs = lrs;

                stateController.getStates(request, response);
            });

            it('should return 200 if lrs is proper and params are valid', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(200);
                    done();
                };

                request.lrs = lrs;
                request.query = {
                    activityId: '1',
                    agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}'
                };

                stateController.getStates(request, response);
            });

            it('should return 200 if lrs is proper and params are valid and stateId is specified', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(200);
                    done();
                };

                request.lrs = lrs;
                request.query = {
                    activityId: '1',
                    stateId: '999',
                    agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}'
                };

                stateController.getStates(request, response);
            });
        });

        describe('createState method', function() {
            it('should exist', function(done) {
                should.exist(stateController.createState);
                done();
            });

            it('should return 400 if lrs is improper', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(400);
                    done();
                };

                request.lrs = {};

                stateController.createState(request, response);
            });

            it('should return 400 if lrs is proper and params are undefined', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(400);
                    done();
                };

                request.lrs = lrs;

                stateController.createState(request, response);
            });

            it('should return 400 if lrs is proper and params are invalid', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(400);
                    done();
                };

                request.lrs = lrs;
                request.getContentType = function() {
                    return 'application/json';
                };
                request.body = {
                    content: 'dsa'
                };

                stateController.createState(request, response);
            });

            it('should return 204 if lrs is proper and params are valid', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(204);
                    done();
                };

                request.lrs = lrs;
                request.getContentType = function() {
                    return 'application/json';
                };
                request.body = {
                    content: {
                        a: 1
                    },
                    activityId: 'dsa',
                    agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                    registration: '067e6162-3b6f-4ae2-a171-2470b63dff00',
                    stateId: '321'
                };

                stateController.createState(request, response);
            });

            it('should update JSON if document already exists', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(204);
                    done();
                };

                request.lrs = lrs;
                request.getContentType = function() {
                    return 'application/json';
                };
                request.body = {
                    content: {
                        a: 1
                    },
                    activityId: 'dsa',
                    agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                    registration: '067e6162-3b6f-4ae2-a171-2470b63dff00',
                    stateId: '321'
                };

                stateController.createState(request, response);
            });

            it('should return 204 if lrs is proper and query params are valid', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(204);
                    done();
                };

                request.lrs = lrs;
                request.getContentType = function() {
                    return '';
                };
                request.query = {
                    content: 'dsa',
                    activityId: 'dsa',
                    agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                    registration: '067e6162-3b6f-4ae2-a171-2470b63dff00',
                    stateId: '3214'
                };
                request.body = '';

                stateController.createState(request, response);
            });
        });

        describe('updateState method', function() {
            it('should exist', function(done) {
                should.exist(stateController.updateState);
                done();
            });

            it('should return 400 if lrs is improper', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(400);
                    done();
                };

                request.lrs = {};

                stateController.updateState(request, response);
            });

            it('should return 400 if lrs is proper and params are undefined', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(400);
                    done();
                };

                request.lrs = lrs;

                stateController.updateState(request, response);
            });

            it('should return 400 if lrs is proper and params are invalid', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(400);
                    done();
                };

                request.lrs = lrs;
                request.getContentType = function() {
                    return 'application/json';
                };
                request.body = {
                    content: 'dsa'
                };

                stateController.updateState(request, response);
            });

            it('should return 400 if lrs is proper and params are invalid for form url', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(400);
                    done();
                };

                request.lrs = lrs;
                request.getContentType = function() {
                    return 'application/x-www-form-urlencoded';
                };
                request.body = {
                    content: 'dsa'
                };

                stateController.updateState(request, response);
            });

            it('should return 204 if lrs is proper and query params are valid', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(204);
                    done();
                };

                request.lrs = lrs;
                request.getContentType = function() {
                    return '';
                };
                request.query = {
                    content: 'dsa',
                    activityId: 'dsa',
                    agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                    registration: '067e6162-3b6f-4ae2-a171-2470b63dff00',
                    stateId: '3215'
                };
                request.body = '';

                stateController.updateState(request, response);
            });

            it('should return 204 if lrs is proper and params are valid for url encoded form', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(204);
                    done();
                };

                request.lrs = lrs;
                request.getContentType = function() {
                    return 'application/x-www-form-urlencoded';
                };
                request.body = {
                    content: 'dsa',
                    activityId: 'dsa',
                    agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                    registration: '067e6162-3b6f-4ae2-a171-2470b63dff00',
                    stateId: '3216'
                };

                stateController.updateState(request, response);
            });

            it('should return 204 if lrs is proper and params are valid', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(204);
                    done();
                };

                request.lrs = lrs;
                request.getContentType = function() {
                    return 'application/json';
                };
                request.body = {
                    content: 'dsa',
                    activityId: 'dsa',
                    agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                    registration: '067e6162-3b6f-4ae2-a171-2470b63dff00',
                    stateId: '321'
                };

                stateController.updateState(request, response);
            });
        });

        describe('deleteStates method', function() {
            it('should exist', function(done) {
                should.exist(stateController.deleteStates);
                done();
            });

            it('should return 400 if lrs is improper', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(400);
                    done();
                };

                request.lrs = {};

                stateController.deleteStates(request, response);
            });

            it('should return 204 if lrs is proper and params are proper', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(204);
                    done();
                };

                request.lrs = {};
                request.query = {
                    content: 'dsa',
                    activityId: 'dsa',
                    agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                    registration: '067e6162-3b6f-4ae2-a171-2470b63dff00',
                    stateId: '321'
                };

                stateController.deleteStates(request, response);
            });
        });
    });
});
