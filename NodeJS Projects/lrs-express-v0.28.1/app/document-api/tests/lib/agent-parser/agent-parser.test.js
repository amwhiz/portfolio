// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
'use strict';

var expect = require('chai').expect,
    agentParser = require('../../../lib/agent-parser/agent-parser'),
    params,
    expectedResult,
    result,
    lrsId = '54997a42aa3bddfe258b456b';

describe('Unit tests', function() {
    describe('Agent Parser', function() {
        it('should exist', function() {
            expect(agentParser).to.exist();
        });

        it('should be a object', function() {
            expect(agentParser).to.be.an('object');
        });

        describe('parseGetParams', function() {
            it('should exist', function() {
                expect(agentParser.parseGetParams).to.be.an('function');
            });

            it('should parse properly', function() {
                params = {
                    profileId: 'dsa',
                    agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                    since: '2015-01-06 11:11:39.960Z'
                };

                expectedResult = {
                    lrs: lrsId,
                    documentType: 'agent',
                    profileId: 'dsa',
                    'agent.account.homePage': 'http://www.example.com',
                    'agent.account.name': '1625378',
                    createdAt: {
                        $gt: new Date('2015-01-06 11:11:39.960Z')
                    }
                };

                result = agentParser.parseGetParams(lrsId, params);
                expect(result).to.be.deep.equal(expectedResult);
            });
        });

        describe('parsePostParams', function() {
            it('should exist', function() {
                expect(agentParser.parsePostParams).to.be.an('function');
            });

            it('should parse properly', function() {
                params = {
                    agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                    profileId: '321'
                };

                expectedResult = {
                    lrs: lrsId,
                    documentType: 'agent',
                    'agent.account.homePage': 'http://www.example.com',
                    'agent.account.name': '1625378',
                    profileId: '321'
                };

                result = agentParser.parsePostParams(lrsId, params);
                expect(result).to.be.deep.equal(expectedResult);
            });
        });
    });
});
