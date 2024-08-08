'use strict';

var expect = require('chai').expect,
    timestampValidator = require('../../../lib/statement-validator/validators/timestamp.validator'),
    messages = require('../../../lib/validator/validator.messages'),
    _ = require('lodash'),
    errors;

describe('Unit tests', function() {
    describe('Timestamp Validator', function() {
        beforeEach(function() {
            errors = [];
        });

        it('should exist', function() {
            expect(timestampValidator).to.exist();
        });

        it('should return error for random string', function() {
            var obj = {
                timestamp: 'dsa'
            };

            errors = timestampValidator(obj);
            expect(errors).to.include(messages.ISO8601('timestamp'));
        });

        it('should return no error for empty object', function() {
            var obj = {};

            errors = timestampValidator(obj);
            expect(errors).to.not.include(messages.ISO8601('timestamp'));
        });
    });
});
