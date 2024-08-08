'use strict';

var expect = require('chai').expect,
    attachmentsValidator = require('../../../lib/statement-validator/validators/attachments.validator'),
    messages = require('../../../lib/validator/validator.messages'),
    _ = require('lodash'),
    errors;

describe('Unit tests', function() {
    describe('Attachments Validator', function() {
        beforeEach(function() {
            errors = [];
        });

        it('should exist', function() {
            expect(attachmentsValidator).to.exist();
        });

        it('should return no error for no id', function() {
            var object = {};

            errors = attachmentsValidator(object);
            expect(errors.length).to.equal(0);
            expect(errors).to.not.include(messages.ARRAY('id'));
        });

        it('should return no error for undefined object', function() {
            var object;

            errors = attachmentsValidator(object);
            expect(errors.length).to.equal(0);
            expect(errors).to.not.include(messages.ARRAY('id'));
        });

        it('should return no error for empty array', function() {
            var object = {attachments: []};

            errors = attachmentsValidator(object);
            expect(errors.length).to.equal(0);
            expect(errors).to.not.include(messages.ARRAY('id'));
        });

        it('should return errors for empty attachment', function() {
            var object = {attachments: [
                {}
            ]};

            errors = attachmentsValidator(object);
            expect(errors.length).to.equal(4);
            expect(errors).to.include(messages.IRI('usageType'));
            expect(errors).to.include(messages.ARRAY('display'));
            expect(errors).to.include(messages.INTEGER('length'));
            expect(errors).to.include(messages.BASE64('sha2'));
        });

        it('should return errors when all required fields is set with wrong values', function() {
            var object = {attachments: [
                {
                    usageType: 'www.google.com.',
                    display: {},
                    length: 'dsa',
                    sha2: '43'
                }
            ]};

            errors = attachmentsValidator(object);
            expect(errors.length).to.equal(4);
            expect(errors).to.include(messages.IRI('usageType'));
            expect(errors).to.include(messages.ARRAY('display'));
            expect(errors).to.include(messages.INTEGER('length'));
            expect(errors).to.include(messages.BASE64('sha2'));
        });

        it('should return no errors when all required fields is set', function() {
            var object = {attachments: [
                {
                    usageType: 'www.google.com',
                    display: [],
                    length: 10,
                    sha2: 'c3VyZS4='
                }
            ]};

            errors = attachmentsValidator(object);
            expect(errors.length).to.equal(0);
            expect(errors).to.not.include(messages.IRI('usageType'));
            expect(errors).to.not.include(messages.ARRAY('display'));
            expect(errors).to.not.include(messages.INTEGER('length'));
            expect(errors).to.not.include(messages.BASE64('sha2'));
        });

        it('should return errors when all optional fields is set with wrong values', function() {
            var object = {attachments: [
                {
                    usageType: 'www.google.com',
                    display: [],
                    length: 10,
                    sha2: 'c3VyZS4=',
                    description: {1: 1},
                    contentType: 'dsa',
                    fileUrl: '321'
                }
            ]};

            errors = attachmentsValidator(object);
            expect(errors.length).to.equal(3);
            expect(errors).to.include(messages.ARRAY('description'));
            expect(errors).to.include(messages.CONTENT_TYPE('contentType'));
            expect(errors).to.include(messages.IRI('fileUrl'));
        });

        it('should return no errors when fields are set', function() {
            var object = {attachments: [
                {
                    usageType: 'www.google.com',
                    display: [],
                    length: 10,
                    sha2: 'c3VyZS4=',
                    description: [],
                    contentType: 'application/json',
                    fileUrl: 'www.google.com'
                }
            ]};

            errors = attachmentsValidator(object);
            expect(errors.length).to.equal(0);
            expect(errors).to.not.include(messages.ARRAY('description'));
            expect(errors).to.not.include(messages.CONTENT_TYPE('contentType'));
            expect(errors).to.not.include(messages.IRI('fileUrl'));
        });
    });
});
