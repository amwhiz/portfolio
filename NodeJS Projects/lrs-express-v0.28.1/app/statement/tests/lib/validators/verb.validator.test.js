'use strict';

var expect = require('chai').expect,
    verbValidator = require('../../../lib/statement-validator/validators/verb.validator'),
    messages = require('../../../lib/validator/validator.messages'),
    _ = require('lodash'),
    errors;

describe('Unit tests', function() {
    describe('Verb Validator', function() {
        beforeEach(function() {
            errors = [];
        });

        it('should exist', function() {
            expect(verbValidator).to.exist();
        });

        it('should return errors for no verb', function() {
            var obj = {};

            errors = verbValidator(obj);
            expect(errors.length).to.equal(4);
            expect(errors).to.include(messages.REQUIRED('verb'));
        });

        it('should return errors for no object verb', function() {
            var obj = {
                verb: ''
            };

            errors = verbValidator(obj);
            expect(errors.length).to.equal(4);
            expect(errors).to.include(messages.REQUIRED('verb'));
        });

        it('should return errors for empty verb', function() {
            var obj = {
                verb: {}
            };

            errors = verbValidator(obj);
            expect(errors.length).to.equal(3);
            expect(errors).to.include(messages.REQUIRED('verb'));
        });

        it('should return errors for no verb id', function() {
            var obj = {
                verb: {
                    display: ''
                }
            };

            errors = verbValidator(obj);
            expect(errors.length).to.equal(2);
            expect(errors).to.include(messages.REQUIRED('verb.id'));
        });

        it('should return errors for empty verb id', function() {
            var obj = {
                verb: {
                    id: ''
                }
            };

            errors = verbValidator(obj);
            expect(errors.length).to.equal(2);
            expect(errors).to.include(messages.REQUIRED('verb.id'));
        });

        it('should return errors for no IRI verb id', function() {
            var obj = {
                verb: {
                    id: 'asd'
                }
            };

            errors = verbValidator(obj);
            expect(errors.length).to.equal(1);
            expect(errors).to.include(messages.IRI('verb.id'));
        });

        it('should return errors for no object verb display', function() {
            var obj = {
                verb: {
                    id: 'http://google.com',
                    display: 'dsa'
                }
            };

            errors = verbValidator(obj);
            expect(errors.length).to.equal(1);
            expect(errors).to.include(messages.OBJECT('verb.display'));
        });

        it('should return no errors for object verb display', function() {
            var obj = {
                verb: {
                    id: 'http://google.com',
                    display: {}
                }
            };

            errors = verbValidator(obj);
            expect(errors.length).to.equal(0);
            expect(errors).to.not.include(messages.OBJECT('verb.display'));
        });
    });
});
