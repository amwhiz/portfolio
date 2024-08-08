'use strict';

var expect = require('chai').expect,
    versionValidator = require('../../../lib/statement-validator/validators/version.validator'),
    messages = require('../../../lib/validator/validator.messages'),
    _ = require('lodash'),
    errors;

describe('Unit tests', function() {
    describe('Version Validator', function() {
        beforeEach(function() {
            errors = [];
        });

        it('should exist', function() {
            expect(versionValidator).to.exist();
        });

        it('should return no errors when version starts from 1.0.', function() {
            var obj = {
                version: '1.0.0'
            };

            errors = versionValidator(obj);
            expect(errors.length).to.equal(0);
            expect(errors).to.not.include(messages.NOT_STARTS('version', '1.0.'));
        });

        it('should return errors when version does not start from 1.0.', function() {
            var obj = {
                version: '0.0.0'
            };

            errors = versionValidator(obj);
            expect(errors.length).to.equal(1);
            expect(errors).to.include(messages.NOT_STARTS('version', '1.0.'));
        });
    });
});
