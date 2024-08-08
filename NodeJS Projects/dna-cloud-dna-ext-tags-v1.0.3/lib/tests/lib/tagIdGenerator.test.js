'use strict';

var tagIdGenerator = require('../../lib/tagIdGenerator'),
    expect = require('chai').expect;

describe('Tag id generator', function() {
    it('should be defined object', function() {
        expect(tagIdGenerator).to.be.an('object');
    });

    describe('method generateId', function() {
        it('should exist', function() {
            expect(tagIdGenerator.generateId).to.be.a('function');
        });

        it('should throw error when tagType is missing ', function() {
            expect(function() {
                tagIdGenerator.generateId();
            }).to.throw();
        });

        it('should create id when lastId is missing ', function() {
            expect(tagIdGenerator.generateId('SKL')).to.be.equal('SKL00001');
        });

        it('should generate id when all arguments are provided', function() {
            expect(tagIdGenerator.generateId('SKL', '12345')).to.equal('SKL12346');
        });

        it('should generate id when all arguments are provided', function() {
            expect(tagIdGenerator.generateId('SKL', '00001')).to.equal('SKL00002');
        });
    });
});
