'use strict';

var expect = require('chai').expect,
    documentTypes = require('../../../lib/document-types/document-types');

describe('Unit tests', function() {
    describe('Document Types', function() {
        it('should exist', function() {
            expect(documentTypes).to.exist();
        });

        it('should be a object', function() {
            expect(documentTypes).to.be.an('object');
        });

        it('should have property STATE', function() {
            expect(documentTypes).to.have.property('STATE');
        });

        it('should have property AGENT', function() {
            expect(documentTypes).to.have.property('AGENT');
        });

        it('should have property ACTIVITY', function() {
            expect(documentTypes).to.have.property('ACTIVITY');
        });
    });
});
