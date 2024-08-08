'use strict';

var expect = require('chai').expect,
    statementValidator = require('../../lib/statement-validator/statement.validator'),
    messages = require('../../lib/validator/validator.messages'),
    _ = require('lodash'),
    errors;

describe('Unit tests', function() {
    describe('Statement Validator', function() {
        describe('property', function() {
            describe('messages', function() {
                it('should be object', function() {
                    messages.should.be.type('object');
                });

                it('should not be empty', function() {
                    messages.should.not.equal({});
                });
            });
        });

        describe('method', function() {
            describe('validate', function() {
                it('should exist', function() {
                    expect(statementValidator.validate).to.exist();
                });

                it('should return errors for empty statement', function() {
                    var obj = {};

                    errors = statementValidator.validate(obj);
                    expect(errors).to.include(messages.REQUIRED('statement'));
                });
            });
        });
    });
});
