'use strict';

var _ = require('lodash'),
    chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    nock = require('nock'),
    DnaDescriptorsImportManager = require('../../../lib/DnaDescriptorsImportManager'),
    testConfiguration = require('../../data/config'),
    jobJsonProto = require('../../data/descriptorJob.json'),
    syllabuses = require('../../data/syllabuses.json'),
    descriptors = require('../../data/descriptors.json'),
    descriptorStatuses = require('../../data/descriptorStatuses'),
    tags = require('../../data/tags.json'),
    ParamsMapper = require('../../../lib/importMapper/ParamsMapper');

chai.use(require('dirty-chai'));
chai.use(require('sinon-chai'));
require('sinon-bluebird');

describe('Import descriptor job', function() {
    var importDescriptorJob,
        descriptorsQueue,
        jobJson,
        apiClient,
        apiNock,
        descriptiveId;

    beforeEach(function() {
        var dnaDescriptorsImportManager = new DnaDescriptorsImportManager(testConfiguration);
        apiClient = dnaDescriptorsImportManager.apiClient;
        apiNock = nock(apiClient.dnaApiClientCore.getHost());
        descriptorsQueue = dnaDescriptorsImportManager.getDescriptorsQueue();
        importDescriptorJob = dnaDescriptorsImportManager.descriptorsWorker.callbacks.import;
        jobJson = _.cloneDeep(jobJsonProto);

        descriptiveId = jobJson.params.descriptor['Descriptive ID'];

        nock.disableNetConnect();

        sinon.stub(apiClient.dnaDescriptorsApiClient, 'searchDescriptor').resolves(descriptors);
        sinon.stub(apiClient.dnaDescriptorsApiClient, 'getDescriptor').resolves(descriptors.data[0]);
        sinon.stub(apiClient.dnaDescriptorsApiClient, 'putDescriptor').resolves(descriptors.data[0]);
        sinon.stub(apiClient.dnaDescriptorsApiClient, 'postDescriptor').resolves(descriptors.data[0]);
        sinon.stub(apiClient.dnaTagsApiClient, 'getAllTags').resolves(tags);
        sinon.stub(apiClient.dnaSyllabusApiClient, 'getSyllabuses').resolves(syllabuses);
        sinon.stub(apiClient.dnaDescriptorStatusApiClient, 'getDescriptorStatusList').resolves(descriptorStatuses);
    });

    afterEach(function() {
        nock.cleanAll();
        nock.enableNetConnect(/.*/);

        apiClient.dnaDescriptorsApiClient.searchDescriptor.restore();
        apiClient.dnaDescriptorsApiClient.getDescriptor.restore();
        apiClient.dnaDescriptorsApiClient.putDescriptor.restore();
        apiClient.dnaDescriptorsApiClient.postDescriptor.restore();
        apiClient.dnaTagsApiClient.getAllTags.restore();
        apiClient.dnaSyllabusApiClient.getSyllabuses.restore();
        apiClient.dnaDescriptorStatusApiClient.getDescriptorStatusList.restore();
    });

    it('should exist', function(done) {
        expect(importDescriptorJob).to.exist();
        done();
    });

    it('should import existing descriptor', function(done) {
        var expectedDescriptorToSend;

        expectedDescriptorToSend = {
            descriptiveId: 'TESTVEENA001',
            descriptor: 'n2Can dsa adopt a level of formality appropriate to the circumstances.',
            syllabuses: ['5459d4f738418f5c216a2a5f', '5459d53338418f5c216a2a61', '5459d52738418f5c216a2a60'],
            descriptors: [],
            attribution: '(N2000);',
            descriptorStatus: 'removed',
            status: true,
            tags: [
                {
                    tagId: ['5459cd3581c2042c17fd042d'],
                    tagTypeName: 'CEFR',
                    tagTypeId: '5459cc1981c2042c17fd0420'
                },
                {
                    tagId: ['5459d0d281c2042c17fd0477'],
                    tagTypeName: 'GSE Value',
                    tagTypeId: '5459cc0481c2042c17fd041d'
                },
                {
                    tagId: ['5459cc9e81c2042c17fd0422', '5459cc9681c2042c17fd0421', '5459cccc81c2042c17fd0425'],
                    tagTypeName: 'Skill',
                    tagTypeId: '5459cc1081c2042c17fd041f'
                }],
            additionalInformation: {
                'Draft IDs': '10067',
                'Batch ': 'Batch 2',
                Source: 'North',
                'Function/Notion': '',
                Example: '',
                Anchor: 'Y',
                'Estimated Level': '',
                'Source Descriptor': 'Can adopt a level of formality appropriate to the circumstances. (North)',
                'CEFR Communicative activity': '',
                'N2000 Logit': '2'
            }
        };

        importDescriptorJob(jobJson.params, function() {
            expect(jobJson.params.descriptorToSend).to.be.eql(expectedDescriptorToSend);

            expect(apiClient.dnaDescriptorsApiClient.searchDescriptor.called).to.be.false();
            expect(apiClient.dnaDescriptorsApiClient.getDescriptor.called).to.be.true();
            expect(apiClient.dnaDescriptorsApiClient.putDescriptor.called).to.be.true();
            expect(apiClient.dnaDescriptorsApiClient.postDescriptor.called).to.be.false();
            expect(apiClient.dnaTagsApiClient.getAllTags.called).to.be.true();
            expect(apiClient.dnaSyllabusApiClient.getSyllabuses.called).to.be.true();
            expect(apiClient.dnaDescriptorStatusApiClient.getDescriptorStatusList.called).to.be.true();

            done();
        });
    });

    it('should import new descriptor', function(done) {
        apiClient.dnaDescriptorsApiClient.getDescriptor.restore();
        sinon.stub(apiClient.dnaDescriptorsApiClient, 'getDescriptor').rejects({message: 'some-message'});

        importDescriptorJob(jobJson.params, function() {
            expect(apiClient.dnaDescriptorsApiClient.searchDescriptor.called).to.be.false();
            expect(apiClient.dnaDescriptorsApiClient.getDescriptor.called).to.be.true();
            expect(apiClient.dnaDescriptorsApiClient.putDescriptor.called).to.be.false();
            expect(apiClient.dnaDescriptorsApiClient.postDescriptor.called).to.be.true();
            expect(apiClient.dnaTagsApiClient.getAllTags.called).to.be.true();
            expect(apiClient.dnaSyllabusApiClient.getSyllabuses.called).to.be.true();
            expect(apiClient.dnaDescriptorStatusApiClient.getDescriptorStatusList.called).to.be.true();

            done();
        });
    });

    it('should not import descriptor if user does not have rights', function(done) {
        jobJson.params.uploader.roles = [];
        importDescriptorJob(jobJson.params, function(err) {
            expect(err).to.be.instanceOf(Error);
            expect(err.message).to.be.equal('User does not have edit rights');
            done();
        });
    });

    it('should not import descriptor if user is not defined', function(done) {
        delete jobJson.params.uploader;
        importDescriptorJob(jobJson.params, function(err) {
            expect(err).to.be.instanceOf(Error);
            done();
        });
    });

    it('should not import descriptor if params is undefined', function(done) {
        importDescriptorJob(undefined, function(err) {
            expect(err).to.be.instanceOf(Error);
            expect(err.message).to.be.equal('User does not have edit rights');
            done();
        });
    });

    describe('errors handling', function() {
        it('handle errors from apiClient.getAllTags', function(done) {
            var error = new Error('getAllTags error');

            apiClient.dnaTagsApiClient.getAllTags.restore();
            sinon.stub(apiClient.dnaTagsApiClient, 'getAllTags').throws(error);

            importDescriptorJob(jobJson.params, function(err) {
                expect(err).to.be.equal(error);
                expect(err.message).to.be.equal(error.message);
                done();
            });
        });

        it('handle errors from apiClient.getAllTags', function(done) {
            var error = new Error('getSyllabuses error');

            apiClient.dnaSyllabusApiClient.getSyllabuses.restore();
            sinon.stub(apiClient.dnaSyllabusApiClient, 'getSyllabuses').throws(error);

            importDescriptorJob(jobJson.params, function(err) {
                expect(err).to.be.equal(error);
                expect(err.message).to.be.equal(error.message);
                done();
            });
        });

        it('handle errors from apiClient.getAllTags', function(done) {
            var error = new Error('getDescriptorStatusList error');

            apiClient.dnaDescriptorStatusApiClient.getDescriptorStatusList.restore();
            sinon.stub(apiClient.dnaDescriptorStatusApiClient, 'getDescriptorStatusList').throws(error);

            importDescriptorJob(jobJson.params, function(err) {
                expect(err).to.be.equal(error);
                expect(err.message).to.be.equal(error.message);
                done();
            });
        });

        it('handle errors from ParamsMapper.retrieveDescriptor', function(done) {
            var error = new Error('ParamsMapper.retrieveDescriptor error');

            sinon.stub(ParamsMapper.prototype, 'retrieveDescriptor').throws(error);

            importDescriptorJob(jobJson.params, function(err) {
                expect(err).to.be.instanceOf(Error);
                expect(err.message).to.be.equal(error.message);

                ParamsMapper.prototype.retrieveDescriptor.restore();

                done();
            });
        });

        it('handle errors validation errors', function(done) {
            var error = {errors: [{param: 'param1', msg: 'msg1'}, {param: 'param2', msg: 'msg2'}]},
                expedcedMessage;

            expedcedMessage = _.map(error.errors, function(e) {
                return [e.param, e.msg].join(': ');
            }).join(', ');

            sinon.stub(ParamsMapper.prototype, 'retrieveDescriptor').throws(error);

            importDescriptorJob(jobJson.params, function(err) {
                expect(err).to.be.instanceOf(Error);

                expect(err.message).to.be.equal(expedcedMessage);

                done();
            });
        });
    });
});
