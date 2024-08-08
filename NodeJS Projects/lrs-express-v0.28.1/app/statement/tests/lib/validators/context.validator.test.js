'use strict';

var expect = require('chai').expect,
    contextValidator = require('../../../lib/statement-validator/validators/context.validator'),
    messages = require('../../../lib/validator/validator.messages'),
    _ = require('lodash'),
    errors;

describe('Unit tests', function() {
    describe('Context Validator', function() {
        beforeEach(function() {
            errors = [];
        });

        it('should exist', function() {
            expect(contextValidator).to.exist();
        });

        it('should return no errors for empty object.', function() {
            var obj = {};

            errors = contextValidator(obj);
            expect(errors.length).to.equal(0);
        });

        it('should return errors for string context.', function() {
            var obj = {
                context: 'dsa'
            };

            errors = contextValidator(obj);
            expect(errors.length).to.equal(1);
            expect(errors).to.include(messages.OBJECT('context'));
        });

        it('should return errors for wrong optional params', function() {
            var obj = {
                context: {
                    registration: 'dsa',
                    instructor: 'dsa',
                    team: 'dsa',
                    revision: [11],
                    platform: [11],
                    language: [11],
                    statement: 'dwa',
                    extensions: 'dsa',
                    contextActivities: 'dsa'
                }
            };

            errors = contextValidator(obj);
            expect(errors.length).to.equal(9);
            expect(errors).to.include(messages.UUID('context.registration'));
            expect(errors).to.include(messages.OBJECT('context.instructor'));
            expect(errors).to.include(messages.OBJECT('context.team'));
            expect(errors).to.include(messages.STRING('context.revision'));
            expect(errors).to.include(messages.STRING('context.platform'));
            expect(errors).to.include(messages.STRING('context.language'));
            expect(errors).to.include(messages.UUID('context.statement'));
            expect(errors).to.include(messages.OBJECT('context.extensions'));
            expect(errors).to.include(messages.OBJECT('context.contextActivities'));
        });

        it('should return no errors when all optional are set with proper values', function() {
            var obj = {
                context: {
                    registration: '067e6162-3b6f-4ae2-a171-2470b63dff00',
                    statement: '067e6162-3b6f-4ae2-a171-2470b63dff00',
                    instructor: {1: 1},
                    team: {1: 1},
                    extensions: {1: 1},
                    contextActivities: {1: 1},
                    revision: 'dsa',
                    platform: 'dsa',
                    language: 'dsa'
                }
            };

            errors = contextValidator(obj);
            expect(errors.length).to.equal(0);
            expect(errors).to.not.include(messages.UUID('context.registration'));
            expect(errors).to.not.include(messages.OBJECT('context.instructor'));
            expect(errors).to.not.include(messages.OBJECT('context.team'));
            expect(errors).to.not.include(messages.STRING('context.revision'));
            expect(errors).to.not.include(messages.STRING('context.platform'));
            expect(errors).to.not.include(messages.STRING('context.language'));
            expect(errors).to.not.include(messages.UUID('context.statement'));
            expect(errors).to.not.include(messages.OBJECT('context.extensions'));
            expect(errors).to.not.include(messages.OBJECT('context.contextActivities'));
        });
    });
});
