'use strict';

var chai = require('chai'),
    sinon = require('sinon'),
    expect = chai.expect,
    dnaDescriptorToXlsxRow = require('../../../lib/exportMapper/dnaDescriptorToXlsxRow');

chai.use(require('dirty-chai'));

describe('Params mapper', function() {
    it('should exist', function(done) {
        expect(dnaDescriptorToXlsxRow).to.exist();
        done();
    });

    describe('setUnknownAdditionalInformationFieldIfNeeded', function() {
        it('should not set if key is known', function(done) {
            sinon.stub(dnaDescriptorToXlsxRow, 'getAdditionalInformationField');
            dnaDescriptorToXlsxRow.setUnknownAdditionalInformationFieldIfNeeded({key: 'val'}, 'key', {});
            expect(dnaDescriptorToXlsxRow.getAdditionalInformationField.called).to.be.false();
            dnaDescriptorToXlsxRow.getAdditionalInformationField.restore();
            done();
        });
    });
});
