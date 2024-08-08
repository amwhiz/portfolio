'use strict';

var assert = require('assert'),
    syllabusesController = require('../../controllers/syllabuses.server.controller'),
    nock = require('nock'),
    httpMocks = require('node-mocks-http'),
    syllabusesApiClient = require('../../../dnaApiClient').dnaSyllabusApiClient,
    sharedBehaviours = require('../../../tests/sharedBehaviors'),
    apiMock;

describe('Syllabuses controller', function() {
    var nextMock = function() {
    };

    sharedBehaviours.nock();

    before(function() {
        apiMock = nock(syllabusesApiClient.getHost());
    });

    describe('Method list:', function() {
        it('should return syllabuses list from api', function(done) {
            var apiRespondData,
                response = httpMocks.createResponse(),
                request = httpMocks.createRequest();

            apiRespondData = [
                {name: 'syllabus1', id: '1'},
                {name: 'syllabus2', id: '2'}
            ];

            apiMock.get(syllabusesApiClient.getSyllabusesUri(request, false)).
                reply(200, apiRespondData);

            response.json = function(data) {
                assert.deepEqual(apiRespondData, data);
                done();
            };

            syllabusesController.list(request, response, nextMock);
        });
    });
});
