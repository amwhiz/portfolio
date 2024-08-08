'use strict';

var fieldsToReturnBuilder = require('../../lib/fieldsToReturnBuilder'),
    expect = require('chai').expect;

describe('Fields to return builder', function() {
    it('should be defined object', function(done) {
        expect(fieldsToReturnBuilder).to.be.a('object');
        done();
    });

    describe('method build', function() {
        it('should exist', function() {
            expect(fieldsToReturnBuilder.build).to.be.a('function');
        });

        it('should filter \'_id\' and \'additionalInformation\' from fields', function() {
            var fields = require('../data/model-fields.js');

            expect(fieldsToReturnBuilder.build(fields)).to.not.contain('additionalInformation');
            expect(fieldsToReturnBuilder.build(fields)).to.contain('tagTypeId');
            expect(fieldsToReturnBuilder.build(fields)).to.contain('tagTypeLabel');
            expect(fieldsToReturnBuilder.build(fields)).to.contain('tagTypeImportColumn');
            expect(fieldsToReturnBuilder.build(fields)).to.contain('tagTypeRole');
        });
    });
});