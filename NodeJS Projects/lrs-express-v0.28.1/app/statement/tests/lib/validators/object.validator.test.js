'use strict';

var expect = require('chai').expect,
    objectValidator = require('../../../lib/statement-validator/validators/object.validator'),
    messages = require('../../../lib/validator/validator.messages'),
    _ = require('lodash'),
    errors;

describe('Unit tests', function() {
    describe('Object Validator', function() {
        beforeEach(function() {
            errors = [];
        });

        it('should exist', function() {
            expect(objectValidator).to.exist();
        });

        it('should return errors for no object', function() {
            var obj = {};

            errors = objectValidator(obj);
            expect(errors.length).to.equal(4);
            expect(errors).to.include(messages.REQUIRED('object'));
        });

        it('should return errors for empty object', function() {
            var obj = {
                object: {}
            };

            errors = objectValidator(obj);
            expect(errors.length).to.equal(3);
            expect(errors).to.include(messages.REQUIRED('object'));
        });

        it('should return errors for no object type object', function() {
            var obj = {
                object: 'dsa'
            };

            errors = objectValidator(obj);
            expect(errors.length).to.equal(3);
            expect(errors).to.include(messages.OBJECT('object'));
        });

        it('should return no errors for if objectType is from range', function() {
            var obj,
                range = ['Activity', 'Group', 'Agent', 'SubStatement', 'StatementRef'];

            obj = {
                object: {
                    objectType: 'Activity'
                }
            };

            errors = objectValidator(obj);
            expect(errors.length).to.equal(2);
            expect(errors).to.not.include(messages.RANGE('object.objectType', range));
        });

        it('should return errors for if objectType is not from range', function() {
            var obj,
                range = ['Activity', 'Group', 'Agent', 'SubStatement', 'StatementRef'];

            obj = {
                object: {
                    objectType: 'dsa'
                }
            };

            errors = objectValidator(obj);
            expect(errors.length).to.equal(3);
            expect(errors).to.include(messages.RANGE('object.objectType', range));
        });

        it('should return errors for no object id', function() {
            var obj = {
                object: {
                    1: 1
                }
            };

            errors = objectValidator(obj);
            expect(errors.length).to.equal(2);
            expect(errors).to.include(messages.REQUIRED('object.id'));
        });

        it('should return errors for empty object id', function() {
            var obj = {
                object: {
                    1: 1
                }
            };

            errors = objectValidator(obj);
            expect(errors.length).to.equal(2);
            expect(errors).to.include(messages.REQUIRED('object.id'));
        });

        it('should return errors for no iri object id', function() {
            var obj = {
                object: {
                    id: 'dsa'
                }
            };

            errors = objectValidator(obj);
            expect(errors.length).to.equal(1);
            expect(errors).to.include(messages.IRI('object.id'));
        });

        it('should return errors when objectType is StatementRef and id is not UUID', function() {
            var obj = {
                object: {
                    id: 'asd',
                    objectType: 'StatementRef'
                }
            };

            errors = objectValidator(obj);
            expect(errors.length).to.equal(1);
            expect(errors).to.include(messages.UUID('object.id'));
        });

        it('should return errors when objectType is StatementRef and definition is not empty', function() {
            var obj = {
                object: {
                    id: '8f87ccde-bb56-4c2e-ab83-44982ef22df0',
                    objectType: 'StatementRef',
                    definition: [1, 2, 3]
                }
            };

            errors = objectValidator(obj);
            expect(errors.length).to.equal(2);
            expect(errors).to.include(messages.NOT_EXIST('object.definition'));
        });
    });
});
