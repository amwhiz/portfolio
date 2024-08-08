// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
'use strict';

var expect = require('chai').expect,
    stateParser = require('../../../lib/state-parser/state-parser'),
    params,
    expectedResult,
    result,
    lrsId = '54997a42aa3bddfe258b456b';

describe('Unit tests', function() {
    describe('State Parser', function() {
        it('should exist', function() {
            expect(stateParser).to.exist();
        });

        it('should be a object', function() {
            expect(stateParser).to.be.an('object');
        });

        describe('parseGetParams', function() {
            it('should exist', function() {
                expect(stateParser.parseGetParams).to.be.an('function');
            });

            it('should parse properly', function() {
                params = {
                    activityId: 'dsa',
                    agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                    since: '2015-01-06 11:11:39.960Z',
                    registration: '067e6162-3b6f-4ae2-a171-2470b63dff00'
                };

                expectedResult = {
                    lrs: lrsId,
                    documentType: 'state',
                    activityId: 'dsa',
                    'agent.account.homePage': 'http://www.example.com',
                    'agent.account.name': '1625378',
                    registration: '067e6162-3b6f-4ae2-a171-2470b63dff00',
                    createdAt: {
                        $gt: new Date('2015-01-06 11:11:39.960Z')
                    }
                };

                result = stateParser.parseGetParams(lrsId, params);
                expect(result).to.be.deep.equal(expectedResult);
            });
        });

        describe('parsePostParams', function() {
            it('should exist', function() {
                expect(stateParser.parsePostParams).to.be.an('function');
            });

            it('should parse properly', function() {
                params = {
                    activityId: 'dsa',
                    agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                    since: '2015-01-06 11:11:39.960Z',
                    registration: '067e6162-3b6f-4ae2-a171-2470b63dff00',
                    stateId: '321'
                };

                expectedResult = {
                    lrs: lrsId,
                    documentType: 'state',
                    activityId: 'dsa',
                    'agent.account.homePage': 'http://www.example.com',
                    'agent.account.name': '1625378',
                    registration: '067e6162-3b6f-4ae2-a171-2470b63dff00',
                    stateId: '321'
                };

                result = stateParser.parsePostParams(lrsId, params);
                expect(result).to.be.deep.equal(expectedResult);
            });

            it('should set null if no registration', function() {
                params = {
                    activityId: 'dsa',
                    agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                    since: '2015-01-06 11:11:39.960Z',
                    stateId: '321'
                };

                expectedResult = {
                    lrs: lrsId,
                    documentType: 'state',
                    activityId: 'dsa',
                    'agent.account.homePage': 'http://www.example.com',
                    'agent.account.name': '1625378',
                    registration: null,
                    stateId: '321'
                };

                result = stateParser.parsePostParams(lrsId, params);
                expect(result).to.be.deep.equal(expectedResult);
            });
        });
    });
});
