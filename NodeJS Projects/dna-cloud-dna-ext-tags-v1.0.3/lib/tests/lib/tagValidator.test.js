'use strict';

var tagValidator = require('../../lib/tagValidator'),
    expect = require('chai').expect;

describe('Tag validator', function() {
    it('should be defined object', function() {
        expect(tagValidator).to.be.an('object');
    });

    describe('method validate', function() {
        it('should exist', function() {
            expect(tagValidator.validate).to.be.a('function');
        });

        it('should return error for empty data', function(done) {
            tagValidator
                .validate({})
                .catch(function(err) {
                    expect(err.details[0].message).to.equal('"tagId" is required');
                    done();
                });
        });

        it('should return error for empty tagId', function(done) {
            var data = {
                tagId: ''
            };

            tagValidator
                .validate(data)
                .catch(function(err) {
                    expect(err.details[0].message).to.equal('"tagId" is not allowed to be empty');
                    done();
                });
        });

        it('should return error for improper tagId', function(done) {
            var data = {
                tagId: 'asd'
            };

            tagValidator
                .validate(data)
                .catch(function(err) {
                    expect(err.details[0].message).to.equal('"tagId" with value "' + data.tagId + '" fails to match the required pattern: /^[A-Z]{2,4}\\d{5}$/');
                    done();
                });
        });

        it('should return error for improper tagId', function(done) {
            var data = {
                tagId: 'ASD'
            };

            tagValidator
                .validate(data)
                .catch(function(err) {
                    expect(err.details[0].message).to.equal('"tagId" with value "' + data.tagId + '" fails to match the required pattern: /^[A-Z]{2,4}\\d{5}$/');
                    done();
                });
        });

        it('should return tagLabel error for proper tagId', function(done) {
            var data = {
                tagId: 'ASD00001'
            };

            tagValidator
                .validate(data)
                .catch(function(err) {
                    expect(err.details[0].message).to.equal('"tagLabel" is required');
                    done();
                });
        });

        it('should return tagTypeId error for proper tagId and tagLabel', function(done) {
            var data = {
                tagId: 'ASD00001',
                tagLabel: 'dsa'
            };

            tagValidator
                .validate(data)
                .catch(function(err) {
                    expect(err.details[0].message).to.equal('"tagTypeId" is required');
                    done();
                });
        });

        it('should return no error for proper tagId, tagLabel and tagTypeId', function(done) {
            var data = {
                tagId: 'ASD00001',
                tagLabel: 'dsa',
                tagTypeId: 'ASD'
            };

            tagValidator
                .validate(data)
                .then(function() {
                    done();
                });
        });
    });
});