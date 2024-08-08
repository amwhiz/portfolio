'use strict';

var expect = require('chai').expect,
    resultValidator = require('../../../lib/statement-validator/validators/result.validator'),
    messages = require('../../../lib/validator/validator.messages'),
    _ = require('lodash'),
    errors;

describe('Unit tests', function() {
    describe('Result Validator', function() {
        beforeEach(function() {
            errors = [];
        });

        it('should exist', function() {
            expect(resultValidator).to.exist();
        });

        it('should return no errors for empty object.', function() {
            var obj = {};

            errors = resultValidator(obj);
            expect(errors.length).to.equal(0);
        });

        it('should return errors for string result.', function() {
            var obj = {
                result: 'dsa'
            };

            errors = resultValidator(obj);
            expect(errors.length).to.equal(1);
            expect(errors).to.include(messages.OBJECT('result'));
        });

        it('should return errors for wrong optional params', function() {
            var obj = {
                result: {
                    success: 'dsa',
                    completion: 'dsa',
                    response: [11],
                    duration: 'dsa',
                    extensions: [11],
                    score: [11]
                }
            };

            errors = resultValidator(obj);
            expect(errors.length).to.equal(6);
            expect(errors).to.include(messages.BOOL('result.success'));
            expect(errors).to.include(messages.BOOL('result.completion'));
            expect(errors).to.include(messages.STRING('result.response'));
            expect(errors).to.include(messages.ISO8601('result.duration'));
            expect(errors).to.include(messages.OBJECT('result.extensions'));
            expect(errors).to.include(messages.OBJECT('result.score'));
        });

        it('should return no errors when all optional are set with proper values', function() {
            var obj = {
                result: {
                    success: true,
                    completion: false,
                    response: 'dsa',
                    duration: '2004-02-12T15:19:21+00:00',
                    extensions: {1: 1},
                    score: {1: 1}
                }
            };

            errors = resultValidator(obj);
            expect(errors.length).to.equal(0);
            expect(errors).to.not.include(messages.BOOL('result.success'));
            expect(errors).to.not.include(messages.BOOL('result.completion'));
            expect(errors).to.not.include(messages.STRING('result.response'));
            expect(errors).to.not.include(messages.ISO8601('result.duration'));
            expect(errors).to.not.include(messages.OBJECT('result.extensions'));
            expect(errors).to.not.include(messages.OBJECT('result.score'));
        });
    });
});
