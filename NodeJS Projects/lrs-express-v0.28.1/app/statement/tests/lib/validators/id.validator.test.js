'use strict';

var expect = require('chai').expect,
    idValidator = require('../../../lib/statement-validator/validators/id.validator'),
    messages = require('../../../lib/validator/validator.messages'),
    _ = require('lodash'),
    errors;

describe('Unit tests', function() {
    describe('Id Validator', function() {
        beforeEach(function() {
            errors = [];
        });

        it('should exist', function() {
            expect(idValidator).to.exist();
        });

        it('should return error for improper id', function() {
            var object = {id: 'dsa'};

            errors = idValidator(object);
            expect(errors).to.include(messages.UUID('id'));
        });

        it('should return no error for no id', function() {
            var object = {};

            errors = idValidator(object);
            expect(errors).to.not.include(messages.UUID('id'));
        });

        it('should return no error for undefined object', function() {
            var object;

            errors = idValidator(object);
            expect(errors).to.not.include(messages.UUID('id'));
        });

        it('should return no error for proper id', function() {
            var object = {id: '067e6162-3b6f-4ae2-a171-2470b63dff00'};

            errors = idValidator(object);
            expect(errors).to.not.include(messages.UUID('id'));
        });
    });
});
