'use strict';

var should = require('should'),
    expect = require('chai').expect,
    httpMocks = require('node-mocks-http'),
    mongoose = require('mongoose'),
    DocumentModel = mongoose.model('Document'),
    LrsModel = mongoose.model('Lrs'),
    agentController = require('../../controllers/agent.controller'),
    httpDecorator = require('../../../http-decorator/middlewares/http.middleware'),
    apiKey,
    lrs,
    request,
    response;

describe('Agent controller', function() {
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

    describe('getProfiles method', function() {
        it('should exist', function(done) {
            should.exist(agentController.getProfiles);
            done();
        });

        it('should return 400 if lrs is improper', function(done) {
            response.json = function() {
                response.statusCode.should.be.eql(400);
                done();
            };

            request.lrs = {};

            agentController.getProfiles(request, response);
        });

        it('should return 400 if lrs is not defined', function(done) {
            response.json = function() {
                response.statusCode.should.be.eql(400);
                done();
            };

            agentController.getProfiles(request, response);
        });

        it('should return 400 if lrs is proper, but there is no params', function(done) {
            response.json = function() {
                response.statusCode.should.be.eql(400);
                done();
            };

            request.lrs = lrs;

            agentController.getProfiles(request, response);
        });

        it('should return 200 if lrs is proper and params are valid', function(done) {
            response.json = function() {
                response.statusCode.should.be.eql(200);
                done();
            };

            request.lrs = lrs;
            request.query = {
                agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}'
            };

            agentController.getProfiles(request, response);
        });

        it('should return 200 if lrs is proper and params are valid and profileId is specified', function(done) {
            response.json = function() {
                response.statusCode.should.be.eql(200);
                done();
            };

            request.lrs = lrs;
            request.query = {
                agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                profileId: '999'
            };

            agentController.getProfiles(request, response);
        });
    });

    describe('createProfile method', function() {
        it('should exist', function(done) {
            should.exist(agentController.createProfile);
            done();
        });

        it('should return 400 if lrs is improper', function(done) {
            response.json = function() {
                response.statusCode.should.be.eql(400);
                done();
            };

            request.lrs = {};

            agentController.createProfile(request, response);
        });

        it('should return 400 if lrs is proper and params are undefined', function(done) {
            response.json = function() {
                response.statusCode.should.be.eql(400);
                done();
            };

            request.lrs = lrs;

            agentController.createProfile(request, response);
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

            agentController.createProfile(request, response);
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
                agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                profileId: '321'
            };

            agentController.createProfile(request, response);
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
                agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                profileId: '321'
            };

            agentController.createProfile(request, response);
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
                agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                profileId: '3214'
            };
            request.body = '';

            agentController.createProfile(request, response);
        });
    });

    describe('updateProfile method', function() {
        it('should exist', function(done) {
            should.exist(agentController.updateProfile);
            done();
        });

        it('should return 400 if lrs is improper', function(done) {
            response.json = function() {
                response.statusCode.should.be.eql(400);
                done();
            };

            request.lrs = {};

            agentController.updateProfile(request, response);
        });

        it('should return 400 if lrs is proper and params are undefined', function(done) {
            response.json = function() {
                response.statusCode.should.be.eql(400);
                done();
            };

            request.lrs = lrs;

            agentController.updateProfile(request, response);
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

            agentController.updateProfile(request, response);
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

            agentController.updateProfile(request, response);
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
                agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                profileId: '3215'
            };
            request.body = '';

            agentController.updateProfile(request, response);
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
                agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                profileId: '3216'
            };

            agentController.updateProfile(request, response);
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
                agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                profileId: '321'
            };

            agentController.updateProfile(request, response);
        });
    });

    describe('deleteProfiles method', function() {
        it('should exist', function(done) {
            should.exist(agentController.deleteProfiles);
            done();
        });

        it('should return 400 if lrs is improper', function(done) {
            response.json = function() {
                response.statusCode.should.be.eql(400);
                done();
            };

            request.lrs = {};

            agentController.deleteProfiles(request, response);
        });

        it('should return 204 if lrs is proper and params are proper', function(done) {
            response.json = function() {
                response.statusCode.should.be.eql(204);
                done();
            };

            request.lrs = {};
            request.query = {
                content: 'dsa',
                agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                profileId: '321'
            };

            agentController.deleteProfiles(request, response);
        });
    });

    describe('getAgents method', function() {
        it('should exist', function(done) {
            should.exist(agentController.getAgents);
            done();
        });

        it('should return 400 if lrs is improper', function(done) {
            response.json = function() {
                response.statusCode.should.be.eql(400);
                done();
            };

            request.lrs = {};

            agentController.getAgents(request, response);
        });

        it('should return 200 if lrs is proper and params are proper', function(done) {
            var expectedData = {
                objectType: 'Person',
                account: [
                    {
                        homePage: 'http://www.example.com',
                        name: '1625378'
                    }
                ]
            };

            response.json = function(data) {
                expect(data).to.deep.equal(expectedData);
                response.statusCode.should.be.eql(200);
                done();
            };

            request.lrs = {};
            request.query = {
                agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}'
            };

            agentController.getAgents(request, response);
        });
    });
});
