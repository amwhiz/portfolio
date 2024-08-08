'use strict';

var assert = require('assert'),
    should = require('should'),
    descriptorsController = require('../../controllers/descriptors.server.controller'),
    nock = require('nock'),
    httpMocks = require('node-mocks-http'),
    dnaApiClient = require('../../../dnaApiClient'),
    descriptorsApiClient = dnaApiClient.dnaDescriptorsApiClient,
    dnaTagsApiClient = dnaApiClient.dnaTagsApiClient,
    apiMock,
    sharedBehaviours = require('../../../tests/sharedBehaviors'),
    user = {userId: 1},
    canEditMockTrue,
    canEditMockFalse;

describe('Descriptors controller', function() {
    var nextMock = function() {
    };

    canEditMockTrue = function() {
        return true;
    };

    canEditMockFalse = function() {
        return false;
    };

    sharedBehaviours.nock();

    before(function() {
        apiMock = nock(descriptorsApiClient.getHost());
    });

    describe('method', function() {
        describe('getDescriptorById:', function() {
            it('should return descriptor from api by id', function(done) {
                var descriptorId = 2,
                    apiRespondData,
                    response = httpMocks.createResponse(),
                    request;

                apiRespondData = {
                    name: 'descriptor',
                    id: descriptorId,
                    gse: []
                };

                request = httpMocks.createRequest({
                    params: {descriptorId: descriptorId}
                });
                request.user = user;
                request.logout = function() {
                };

                response.json = function(data) {
                    assert.deepEqual(apiRespondData.id, data.id);
                    assert.deepEqual(apiRespondData.name, data.name);
                    done();
                };

                apiMock.get(descriptorsApiClient.getDescriptorUri(request, false)).
                    reply(200, apiRespondData);

                descriptorsController.getDescriptorById(request, response, nextMock);
            });
        });

        describe('history', function() {
            it('should exist', function(done) {
                should.exist(descriptorsApiClient.getDescriptorHistory);
                done();
            });

            it('should return descriptor history', function(done) {
                var descriptorId = 2,
                    response = httpMocks.createResponse(),
                    request,
                    apiRespondData;

                request = httpMocks.createRequest({
                    params: {descriptorId: descriptorId}
                });
                request.user = user;
                request.logout = function() {
                };

                apiRespondData = {
                    data: [
                        {name: 'descriptor000', id: descriptorId, gse: []},
                        {name: 'descriptor001', id: descriptorId, gse: []},
                        {name: 'descriptor002', id: descriptorId, gse: []}
                    ]
                };

                response.json = function(data) {
                    assert.deepEqual(apiRespondData.data[0].id, data[0].id);
                    assert.deepEqual(apiRespondData.data[1].id, data[1].id);
                    assert.deepEqual(apiRespondData.data[2].id, data[2].id);

                    assert.deepEqual(apiRespondData.data[0].name, data[0].name);
                    assert.deepEqual(apiRespondData.data[1].name, data[1].name);
                    assert.deepEqual(apiRespondData.data[2].name, data[2].name);
                    done();
                };

                apiMock.get(descriptorsApiClient.getDescriptorHistoryUri(request, false)).
                    reply(200, apiRespondData);

                descriptorsController.history(request, response, function() {
                    done();
                });
            });
        });

        describe('remove', function() {
            it('should not remove descriptor by id from api and go to next middleware if user can\'t edit', function(done) {
                var descriptorId = 2,
                    response = httpMocks.createResponse(),
                    request;

                request = httpMocks.createRequest({
                    params: {descriptorId: descriptorId}
                });
                request.user = user;
                request.canEdit = canEditMockFalse;
                request.logout = function() {
                };
                response.sendForbidden = function() {
                    done();
                };

                descriptorsController.removeDescriptorById(request, response, nextMock);
            });

            it('should remove descriptor by id from api if user canEdit', function(done) {
                var descriptorId = 2,
                    code = 200,
                    resExpected,
                    response = httpMocks.createResponse(),
                    request;

                resExpected = {
                    statusCode: code
                };

                request = httpMocks.createRequest({
                    params: {descriptorId: descriptorId}
                });
                request.user = user;
                request.canEdit = canEditMockTrue;
                request.logout = function() {
                };

                response.json = function(res) {
                    assert.deepEqual(res, resExpected);
                    done();
                };

                apiMock.delete(descriptorsApiClient.getDescriptorUri(request, false)).
                    reply(code, resExpected);

                descriptorsController.removeDescriptorById(request, response, nextMock);
            });

            it('should not remove descriptor by id from api and go to next middleware if incorrect descriptorId was passed and user canEdit', function(done) {
                var descriptorId = 2,
                    response = httpMocks.createResponse(),
                    request;

                request = httpMocks.createRequest({
                    params: {descriptorId: descriptorId}
                });
                request.user = user;
                request.canEdit = canEditMockTrue;
                request.logout = function() {
                };

                descriptorsController.removeDescriptorById(request, response, function() {
                    done();
                });
            });
        });

        describe('update', function() {
            it('should not update descriptor and go to the next middleware if user can\'t edit', function(done) {
                var descriptorId = 2,
                    response = httpMocks.createResponse(),
                    request;

                request = httpMocks.createRequest({
                    params: {descriptorId: descriptorId}
                });
                request.user = user;
                request.canEdit = canEditMockFalse;
                request.logout = function() {
                };
                response.sendForbidden = function() {
                    done();
                };

                descriptorsController.update(request, response, nextMock);
            });

            it('should go to the next middleware if incorrect update data was passed and user canEdit', function(done) {
                var id = 123,
                    data = {},
                    response = httpMocks.createResponse(),
                    request = httpMocks.createRequest();

                request.user = user;
                request.canEdit = canEditMockTrue;
                request.logout = function() {
                };

                request.params.descriptorId = id;
                request.body = data;

                descriptorsController.update(request, response, function() {
                    done();
                });
            });

            it('should make put call to API if correct data is passed and user canEdit', function(done) {
                var data,
                    expectedResponse,
                    response = httpMocks.createResponse(),
                    request = httpMocks.createRequest();

                data = {
                    a: 'aa'
                };

                expectedResponse = {
                    b: 'bb'
                };

                request.params.descriptorId = 123;
                request.body = data;
                request.user = user;
                request.canEdit = canEditMockTrue;
                request.logout = function() {
                };

                response.json = function(actualResponse) {
                    actualResponse.should.be.eql(expectedResponse);
                    done();
                };

                apiMock.put(descriptorsApiClient.getDescriptorUri(request, false), data)
                    .reply(200, expectedResponse);

                descriptorsController.update(request, response, function() {
                    done();
                });
            });
        });

        describe('create', function() {
            it('should not create descriptor and go to the next middleware if user can\'t edit', function(done) {
                var descriptorId = 2,
                    response = httpMocks.createResponse(),
                    request;

                request = httpMocks.createRequest({
                    params: {descriptorId: descriptorId}
                });
                request.user = user;
                request.canEdit = canEditMockFalse;
                request.logout = function() {
                };
                response.sendForbidden = function() {
                    done();
                };

                descriptorsController.create(request, response, nextMock);
            });

            it('should go to the next middleware if incorrect create data is passed and user canEdit', function(done) {
                var response = httpMocks.createResponse(),
                    request = httpMocks.createRequest();

                request.body = {};
                request.user = user;
                request.canEdit = canEditMockTrue;
                request.logout = function() {
                };

                descriptorsController.create(request, response, function() {
                    done();
                });
            });

            it('should make post call to API if correct data is passed and user canEdit', function(done) {
                var data,
                    expectedResponse,
                    response = httpMocks.createResponse(),
                    request = httpMocks.createRequest();

                data = {
                    a: 'aa'
                };

                expectedResponse = {
                    b: 'bb'
                };

                request.body = data;
                request.user = user;
                request.canEdit = canEditMockTrue;
                request.logout = function() {
                };

                response.json = function(actualResponse) {
                    actualResponse.should.be.eql(expectedResponse);
                    done();
                };

                apiMock.post(descriptorsApiClient.getDescriptorsUri(request, false), data)
                    .reply(200, expectedResponse);

                descriptorsController.create(request, response, nextMock);
            });
        });

        describe('search', function() {
            it('should return descriptors list', function(done) {
                var response = httpMocks.createResponse(),
                    request = httpMocks.createRequest({query: {filters: '', isExact: true}}),
                    apiRespondData;

                request.params.searchQuery = 'descriptor';
                request.user = user;
                request.query.filters = '{"tags":{"tags":[]}}';
                request.query.isExact = true;
                request.query.sortBy = '{"order":"asc","property":"descriptiveId"}';
                request.logout = function() {
                };

                apiRespondData = [
                    {name: 'descriptor1', id: '1', gse: []},
                    {name: 'descriptor2', id: '2', gse: []}
                ];

                response.json = function(data) {
                    assert.deepEqual(apiRespondData[0].id, data[0].id);
                    assert.deepEqual(apiRespondData[1].id, data[1].id);
                    assert.deepEqual(apiRespondData[0].name, data[0].name);
                    assert.deepEqual(apiRespondData[1].name, data[1].name);
                    done();
                };

                apiMock
                    .get(descriptorsApiClient.getDescriptorSearchUri(request, false))
                    .reply(200, apiRespondData)
                    .get(dnaTagsApiClient.getTagsUri(httpMocks.createRequest(), false) + '?searchQuery=descriptor')
                    .reply(200, {tags: []});

                descriptorsController
                    .search(request, response, nextMock)
                    .catch(function(err) {
                        console.log(err);
                    })
                ;
            });
        });
    });
});
