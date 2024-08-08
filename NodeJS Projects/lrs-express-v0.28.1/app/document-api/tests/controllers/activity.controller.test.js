'use strict';

var should = require('should'),
    httpMocks = require('node-mocks-http'),
    mongoose = require('mongoose'),
    config = require('../../../../config/env/test'),
    DocumentModel = mongoose.model('Document'),
    LrsModel = mongoose.model('Lrs'),
    uuid = require('node-uuid'),
    activityController = require('../../controllers/activity'),
    httpDecorator = require('../../../http-decorator/middlewares/http.middleware'),
    id,
    apiKey,
    lrs,
    request,
    response;

describe('Unit tests', function() {
    describe('Activity controller', function() {
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

        describe('getActivity method', function() {
            it('should exist', function(done) {
                should.exist(activityController.getActivity);
                done();
            });

            it('should return 400 if lrs is improper', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(400);
                    done();
                };

                request.lrs = {};

                activityController.getActivity(request, response);
            });

            it('should return 400 if lrs is not defined', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(400);
                    done();
                };

                activityController.getActivity(request, response);
            });

            it('should return 400 if lrs is proper, but there is no params', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(400);
                    done();
                };

                request.lrs = lrs;

                activityController.getActivity(request, response);
            });

            it('should return 200 if lrs is proper and params are valid', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(200);
                    done();
                };

                request.lrs = lrs;
                request.query = {
                    activityId: '1'
                };

                activityController.getActivity(request, response);
            });
        });

        describe('getProfiles method', function() {
            it('should exist', function(done) {
                should.exist(activityController.getProfiles);
                done();
            });

            it('should return 400 if lrs is improper', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(400);
                    done();
                };

                request.lrs = {};

                activityController.getProfiles(request, response);
            });

            it('should return 400 if lrs is not defined', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(400);
                    done();
                };

                activityController.getProfiles(request, response);
            });

            it('should return 400 if lrs is proper, but there is no params', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(400);
                    done();
                };

                request.lrs = lrs;

                activityController.getProfiles(request, response);
            });

            it('should return 200 if lrs is proper and params are valid', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(200);
                    done();
                };

                request.lrs = lrs;
                request.query = {
                    activityId: '1'
                };

                activityController.getProfiles(request, response);
            });

            it('should return 200 if lrs is proper and params are valid and profileId is specified', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(200);
                    done();
                };

                request.lrs = lrs;
                request.query = {
                    activityId: '1',
                    profileId: '999'
                };

                activityController.getProfiles(request, response);
            });
        });

        describe('createProfile method', function() {
            it('should exist', function(done) {
                should.exist(activityController.createProfile);
                done();
            });

            it('should return 400 if lrs is improper', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(400);
                    done();
                };

                request.lrs = {};

                activityController.createProfile(request, response);
            });

            it('should return 400 if lrs is proper and params are undefined', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(400);
                    done();
                };

                request.lrs = lrs;

                activityController.createProfile(request, response);
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

                activityController.createProfile(request, response);
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
                    profileId: '321'
                };

                activityController.createProfile(request, response);
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
                    profileId: '321'
                };

                activityController.createProfile(request, response);
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
                    profileId: '3214'
                };
                request.body = '';

                activityController.createProfile(request, response);
            });

            it('should return 400 if lrs is proper and query params are valid, but entity exists', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(400);
                    done();
                };

                request.lrs = lrs;
                request.getContentType = function() {
                    return '';
                };
                request.query = {
                    content: 'dsa',
                    activityId: 'dsa',
                    profileId: '3214'
                };
                request.body = '';

                activityController.createProfile(request, response);
            });
        });

        describe('updateProfile method', function() {
            it('should exist', function(done) {
                should.exist(activityController.updateProfile);
                done();
            });

            it('should return 400 if lrs is improper', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(400);
                    done();
                };

                request.lrs = {};

                activityController.updateProfile(request, response);
            });

            it('should return 400 if lrs is proper and params are undefined', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(400);
                    done();
                };

                request.lrs = lrs;

                activityController.updateProfile(request, response);
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

                activityController.updateProfile(request, response);
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

                activityController.updateProfile(request, response);
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
                    profileId: '3215'
                };
                request.body = '';

                activityController.updateProfile(request, response);
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
                    profileId: '3216'
                };

                activityController.updateProfile(request, response);
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
                    profileId: '321'
                };

                activityController.updateProfile(request, response);
            });
        });

        describe('deleteProfiles method', function() {
            it('should exist', function(done) {
                should.exist(activityController.deleteProfiles);
                done();
            });

            it('should return 400 if lrs is improper', function(done) {
                response.json = function() {
                    response.statusCode.should.be.eql(400);
                    done();
                };

                request.lrs = {};

                activityController.deleteProfiles(request, response);
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
                    profileId: '321'
                };

                activityController.deleteProfiles(request, response);
            });
        });
    });
});
