'use strict';

var _ = require('lodash'),
    chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    nock = require('nock'),
    DnaDescriptorsImportManager = require('../../../lib/DnaDescriptorsImportManager'),
    testConfiguration = require('../../data/config'),
    jobJsonProto = require('../../data/exportDescriptorsAsXlsxJob.json'),
    syllabuses = require('../../data/syllabuses.json'),
    descriptors = require('../../data/descriptors.json'),
    descriptorStatuses = require('../../data/descriptorStatuses'),
    tags = require('../../data/tags.json');

chai.use(require('dirty-chai'));
chai.use(require('sinon-chai'));
require('sinon-bluebird');

describe('Export descriptors to XLSX file job', function() {
    var exportDescriptorsAsXlsxJob,
        jobJson,
        apiClient,
        apiNock;

    beforeEach(function() {
        var dnaDescriptorsImportManager = new DnaDescriptorsImportManager(testConfiguration);
        apiClient = dnaDescriptorsImportManager.apiClient;
        apiNock = nock(apiClient.dnaApiClientCore.getHost());
        exportDescriptorsAsXlsxJob = dnaDescriptorsImportManager.exportDescriptorsAsXlsxWorker.callbacks.export;
        jobJson = _.cloneDeep(jobJsonProto);

        nock.disableNetConnect();
    });

    afterEach(function() {
        nock.cleanAll();
        nock.enableNetConnect(/.*/);
    });

    it('should exist', function(done) {
        expect(exportDescriptorsAsXlsxJob).to.exist();
        done();
    });

    beforeEach(function() {
        sinon.stub(apiClient.dnaDescriptorsApiClient, 'searchDescriptor').resolves(descriptors);
        sinon.stub(apiClient.dnaTagsApiClient, 'getAllTags').resolves(tags);
        sinon.stub(apiClient.dnaSyllabusApiClient, 'getSyllabuses').resolves(syllabuses);
        sinon.stub(apiClient.dnaDescriptorStatusApiClient, 'getDescriptorStatusList').resolves(descriptorStatuses);
    });

    afterEach(function() {
        apiClient.dnaDescriptorsApiClient.searchDescriptor.restore();
        apiClient.dnaTagsApiClient.getAllTags.restore();
        apiClient.dnaSyllabusApiClient.getSyllabuses.restore();
        apiClient.dnaDescriptorStatusApiClient.getDescriptorStatusList.restore();
    });

    it('should export descriptors', function(done) {
        exportDescriptorsAsXlsxJob(jobJson.params, function(_this, data) {
            expect(data).to.be.instanceOf(Buffer);
            expect(data).to.have.length.above(7000);
            done();
        });
    });

    it('should not export descriptors if user does not have rights', function(done) {
        jobJson.params.uploader.roles = [];
        exportDescriptorsAsXlsxJob(jobJson.params, function(err) {
            expect(err).to.be.instanceOf(Error);
            expect(err.message).to.be.equal('User does not have view rights');
            done();
        });
    });

    it('should not export descriptors if user is not defined', function(done) {
        delete jobJson.params.uploader;
        exportDescriptorsAsXlsxJob(jobJson.params, function(err) {
            expect(err).to.be.instanceOf(Error);
            expect(err.message).to.be.equal('Uploader info must be present');
            done();
        });
    });

    it('should not export descriptors if query is not defined', function(done) {
        delete jobJson.params.query;
        exportDescriptorsAsXlsxJob(jobJson.params, function(err) {
            expect(err).to.be.instanceOf(Error);
            expect(err.message).to.be.equal('Query is required');
            done();
        });
    });

    it('should not export descriptor if params is undefined', function(done) {
        exportDescriptorsAsXlsxJob(undefined, function(err) {
            expect(err).to.be.instanceOf(Error);
            expect(err.message).to.be.equal('Uploader info must be present');
            done();
        });
    });
});
