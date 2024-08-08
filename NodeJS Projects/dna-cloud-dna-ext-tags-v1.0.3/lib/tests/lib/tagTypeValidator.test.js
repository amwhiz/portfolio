'use strict';

var tagTypeValidator = require('../../lib/tagTypeValidator'),
    expect = require('chai').expect;

describe('Tag type validator', function() {
    it('should be defined object', function() {
        expect(tagTypeValidator).to.be.an('object');
    });

    describe('method validate', function() {
        it('should exist', function() {
            expect(tagTypeValidator.validate).to.be.a('function');
        });

        it('should return error when data is not object', function(done) {
            tagTypeValidator
                .validate('')
                .catch(function(err) {
                    expect(err.details[0].message).to.equal('"value" must be an object');
                    done();
                });
        });

        it('should return error when tagTypeId is empty', function(done) {
            var data = {
                tagTypeId: ''
            };

            tagTypeValidator
                .validate(data)
                .catch(function(err) {
                    expect(err.details[0].message).to.equal('"tagTypeId" is not allowed to be empty');
                    done();
                });
        });

        it('should return error when tagTypeId is not string', function(done) {
            var data = {
                tagTypeId: 123
            };

            tagTypeValidator
                .validate(data)
                .catch(function(err) {
                    expect(err.details[0].message).to.equal('"tagTypeId" must be a string');
                    done();
                });
        });

        it('should return error when tagTypeId length is shorter than 2', function(done) {
            var data = {
                tagTypeId: 'D'
            };

            tagTypeValidator
                .validate(data)
                .catch(function(err) {
                    expect(err.details[0].message).to.equal('"tagTypeId" length must be at least 2 characters long');
                    done();
                });
        });

        it('should return error when tagTypeId length is longer than 4', function(done) {
            var data = {
                tagTypeId: 'DREWE'
            };

            tagTypeValidator
                .validate(data)
                .catch(function(err) {
                    expect(err.details[0].message).to.equal('"tagTypeId" length must be less than or equal to 4 characters long');
                    done();
                });
        });

        it('should return error when tagTypeId includes lowercase letters', function(done) {
            var data = {
                tagTypeId: 'drew'
            };

            tagTypeValidator
                .validate(data)
                .catch(function(err) {
                    expect(err.details[0].message).to.equal('"tagTypeId" must only contain uppercase characters');
                    done();
                });
        });

        it('should return next field error for proper tagTypeId', function(done) {
            var data = {
                tagTypeId: 'SKL'
            };

            tagTypeValidator
                .validate(data)
                .catch(function(err) {
                    expect(err.details[0].message).to.equal('"tagTypeLabel" is required');
                    done();
                });
        });

        it('should return error when tagTypeLabel is numeric', function(done) {
            var data = {
                tagTypeId: 'SKL',
                tagTypeLabel: 123
            };

            tagTypeValidator
                .validate(data)
                .catch(function(err) {
                    expect(err.details[0].message).to.equal('"tagTypeLabel" must be a string');
                    done();
                });
        });

        it('should call then with data when json is proper', function(done) {
            var data = {
                tagTypeId: 'SKL',
                tagTypeLabel: 'Label'
            };

            tagTypeValidator
                .validate(data)
                .then(function(tagType) {
                    expect(tagType).to.deep.equal(data);
                    done();
                });
        });
    });
});