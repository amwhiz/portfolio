'use strict';

var expect = require('chai').expect,
    activityValidator = require('../../../lib/activity-query-validator/activity-validator'),
    query,
    result;

describe('Unit tests', function() {
    describe('Activity Validator', function() {
        it('should exist', function() {
            expect(activityValidator).to.exist();
        });

        it('should be a object', function() {
            expect(activityValidator).to.be.an('object');
        });

        describe('method validateGet', function() {
            it('should return false for empty object', function() {
                query = {};

                result = activityValidator.validateGet(query);
                expect(result).to.be.false();
            });

            it('should return true when there are all require fields', function() {
                query = {
                    activityId: '1'
                };

                result = activityValidator.validateGet(query);
                expect(result).to.be.true();
            });

            it('should return false when optional field are improper', function() {
                query = {
                    activityId: '1',
                    since: 'dsa'
                };

                result = activityValidator.validateGet(query);
                expect(result).to.be.false();
            });

            it('should return true when optional field are proper', function() {
                query = {
                    activityId: '1',
                    since: '2015-01-06 11:11:39.960Z'
                };

                result = activityValidator.validateGet(query);
                expect(result).to.be.true();
            });
        });

        describe('method validatePost', function() {
            it('should return false for empty object', function() {
                query = {};

                result = activityValidator.validatePost(query);
                expect(result).to.be.false();
            });

            it('should return true for proper object', function() {
                query = {
                    activityId: '1',
                    profileId: '321asd'
                };

                result = activityValidator.validatePost(query);
                expect(result).to.be.true();
            });
        });
    });
});
