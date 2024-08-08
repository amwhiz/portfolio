'use strict';

var expect = require('chai').expect,
    stateValidator = require('../../../lib/state-query-validator/state-validator'),
    query,
    result;

describe('Unit tests', function() {
    describe('State Validator', function() {
        it('should exist', function() {
            expect(stateValidator).to.exist();
        });

        it('should be a object', function() {
            expect(stateValidator).to.be.an('object');
        });

        describe('method validateGet', function() {
            it('should return false for empty object', function() {
                query = {};

                result = stateValidator.validateGet(query);
                expect(result).to.be.false();
            });

            it('should return false when there are no all require fields', function() {
                query = {
                    activityId: '1'
                };

                result = stateValidator.validateGet(query);
                expect(result).to.be.false();
            });

            it('should return true when there are all require fields', function() {
                query = {
                    activityId: '1',
                    agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}'
                };

                result = stateValidator.validateGet(query);
                expect(result).to.be.true();
            });

            it('should return false when optional field are improper', function() {
                query = {
                    activityId: '1',
                    agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                    since: 'dsa'
                };

                result = stateValidator.validateGet(query);
                expect(result).to.be.false();
            });

            it('should return true when optional field are proper', function() {
                query = {
                    activityId: '1',
                    agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                    since: '2015-01-06 11:11:39.960Z',
                    registration: '067e6162-3b6f-4ae2-a171-2470b63dff00'
                };

                result = stateValidator.validateGet(query);
                expect(result).to.be.true();
            });
        });

        describe('method validatePost', function() {
            it('should return false for empty object', function() {
                query = {};

                result = stateValidator.validatePost(query);
                expect(result).to.be.false();
            });

            it('should return true for proper object', function() {
                query = {
                    activityId: '1',
                    agent: '{"account":{"homePage":"http://www.example.com","name":"1625378"}}',
                    stateId: '321asd'
                };

                result = stateValidator.validatePost(query);
                expect(result).to.be.true();
            });
        });
    });
});
