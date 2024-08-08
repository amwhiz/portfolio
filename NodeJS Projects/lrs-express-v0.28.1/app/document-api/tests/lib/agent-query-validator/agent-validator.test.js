'use strict';

var expect = require('chai').expect,
    agentValidator = require('../../../lib/agent-query-validator/agent-validator'),
    query,
    result;

describe('Unit tests', function() {
    describe('Agent Validator', function() {
        it('should exist', function() {
            expect(agentValidator).to.exist();
        });

        it('should be a object', function() {
            expect(agentValidator).to.be.an('object');
        });

        describe('method validateGet', function() {
            it('should return false for empty object', function() {
                query = {};

                result = agentValidator.validateGet(query);
                expect(result).to.be.false();
            });

            it('should return true when there are all require fields', function() {
                query = {
                    profileId: '1',
                    agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}'
                };

                result = agentValidator.validateGet(query);
                expect(result).to.be.true();
            });

            it('should return false when optional field are improper', function() {
                query = {
                    profileId: '1',
                    agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                    since: 'dsa'
                };

                result = agentValidator.validateGet(query);
                expect(result).to.be.false();
            });

            it('should return true when optional field are proper', function() {
                query = {
                    profileId: '1',
                    agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                    since: '2015-01-06 11:11:39.960Z'
                };

                result = agentValidator.validateGet(query);
                expect(result).to.be.true();
            });
        });

        describe('method validatePost', function() {
            it('should return false for empty object', function() {
                query = {};

                result = agentValidator.validatePost(query);
                expect(result).to.be.false();
            });

            it('should return true for proper object', function() {
                query = {
                    agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                    profileId: '321asd'
                };

                result = agentValidator.validatePost(query);
                expect(result).to.be.true();
            });
        });
    });
});
