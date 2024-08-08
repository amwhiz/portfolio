'use strict';

var _ = require('lodash'),
    chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    definedFieldsMap = require('../../../lib/importMapper/definedFieldsMap'),
    ParamsMapper = require('../../../lib/importMapper/ParamsMapper'),
    syllabuses = require('../../data/syllabuses.json'),
    descriptor = _.get(require('../../data/descriptorJob.json'), 'params.descriptor'),
    descriptorStatuses = require('../../data/descriptorStatuses'),
    tags = require('../../data/tags.json');

chai.use(require('dirty-chai'));
chai.use(require('sinon-chai'));

describe('Params mapper', function() {
    var paramsMapper,
        defaultParams;

    beforeEach(function() {
        paramsMapper = new ParamsMapper();
        defaultParams = {
            tagTypes: tags,
            descriptor: descriptor,
            syllabuses: syllabuses,
            descriptorStatuses: descriptorStatuses
        };
    });

    it('should exist', function(done) {
        expect(paramsMapper).to.exist();
        done();
    });

    describe('init', function() {
        it('should set default params', function(done) {
            paramsMapper.init();
            expect(paramsMapper.params).to.be.eql({});
            expect(paramsMapper.descriptor).to.be.eql({});
            done();
        });
    });

    describe('determineFieldName', function() {
        beforeEach(function() {
            paramsMapper.init();
        });

        it('should work with arrays', function(done) {
            expect(function() {
                paramsMapper.determineFieldName('string');
            }).not.to.throw();

            expect(function() {
                paramsMapper.determineFieldName(['array']);
            }).not.to.throw();

            done();
        });
    });

    describe('translateDescriptorsStatusXlsxLabelToDnaKey', function() {
        it('should throw if dna key for xlsx label is not found', function(done) {
            var xlsxLabel = 'xlsxLabel';

            expect(function() {
                paramsMapper.translateDescriptorsStatusXlsxLabelToDnaKey(xlsxLabel);
            }).to.throw('Cannot find status ID for label "' + xlsxLabel + '"');

            done();
        });

        it('should return \'published\' for \'Published\'', function(done) {
            var xlsxLabel = 'Published',
                actual,
                expected = 'published';

            paramsMapper.init(defaultParams);

            expect(function() {
                actual = paramsMapper.translateDescriptorsStatusXlsxLabelToDnaKey(xlsxLabel);
            }).not.to.throw();

            expect(actual).to.equal(expected);

            done();
        });

        it('should ignore white spaces at begging', function(done) {
            var xlsxLabel = '  Published',
                actual,
                expected = 'published';

            paramsMapper.init(defaultParams);

            expect(function() {
                actual = paramsMapper.translateDescriptorsStatusXlsxLabelToDnaKey(xlsxLabel);
            }).not.to.throw();

            expect(actual).to.equal(expected);

            done();
        });

        it('should ignore white spaces at end', function(done) {
            var xlsxLabel = 'Published  ',
                actual,
                expected = 'published';

            paramsMapper.init(defaultParams);

            expect(function() {
                actual = paramsMapper.translateDescriptorsStatusXlsxLabelToDnaKey(xlsxLabel);
            }).not.to.throw();

            expect(actual).to.equal(expected);

            done();
        });
    });

    describe('getSyllabus', function() {
        it('should not return syllabuses with no _id', function(done) {
            paramsMapper.syllabusByName = {
                syllabusA: {},
                syllabusB: {syllabusId: 'this-is-syllabusId'},
                syllabusC: {_id: 'this-is-_id'},
                syllabusD: {syllabusId: 'this-is-another-syllabusId'}
            };

            var expected = [paramsMapper.syllabusByName.syllabusB.syllabusId, paramsMapper.syllabusByName.syllabusD.syllabusId];

            sinon.stub(paramsMapper, 'useDescriptorField');
            paramsMapper.useDescriptorField.withArgs(definedFieldsMap.syllabuses).returns(_.keys(paramsMapper.syllabusByName).join(', '));

            expect(paramsMapper.getSyllabus()).to.eql(expected);

            paramsMapper.useDescriptorField.restore();

            done();
        });
    });
});
