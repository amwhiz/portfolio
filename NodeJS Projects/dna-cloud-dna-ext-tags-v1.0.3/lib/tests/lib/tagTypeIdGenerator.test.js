'use strict';

var tagTypeIdGenerator = require('../../lib/tagTypeIdGenerator'),
    expect = require('chai').expect;

describe('Tag type id generator', function() {
    it('should be defined object', function() {
        expect(tagTypeIdGenerator).to.be.an('object');
    });

    describe('method generateId', function() {
        it('should exist', function() {
            expect(tagTypeIdGenerator.generateId).to.be.a('function');
        });

        it('should throw error when tagTypeId is missing ', function() {
            expect(function() {
                tagTypeIdGenerator.generateId();
            }).to.throw();
        });

        it('should generate id when all tagTypeLabel is provided', function() {
            var expectedResult = 'SKI';

            expect(tagTypeIdGenerator.generateId('Skill')).to.equal(expectedResult);
        });
    });
});
