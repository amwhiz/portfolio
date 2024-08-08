'use strict';

var chai = require('chai'),
    bson = require('bson'),
    expect = chai.expect,
    sinon = require('sinon'),
    DnaDescriptorsImportManager = require('../../../lib/DnaDescriptorsImportManager'),
    testConfiguration = require('../../data/config');

chai.use(require('sinon-chai'));

describe('Import XLSX file job', function() {
    var importXlsxFileJob,
        descriptorsQueue;

    beforeEach(function() {
        var dnaDescriptorsImportManager = new DnaDescriptorsImportManager(testConfiguration);
        descriptorsQueue = dnaDescriptorsImportManager.getDescriptorsQueue();
        importXlsxFileJob = dnaDescriptorsImportManager.xlsxFileWorker.callbacks.import;
    });

    it('should exist', function(done) {
        expect(importXlsxFileJob).to.exist();
        done();
    });

    it('should enqueue descriptors import jobs', function(done) {
        var params;

        this.timeout(5000); // parsing XLSX takes time :-(

        params = require('../../data/xlsxJob.json').params;
        params.xlsBuffer = new bson.Binary(new Buffer(params.xlsBuffer.$binary, 'base64'), +params.xlsBuffer.$type);

        sinon.spy(descriptorsQueue, 'enqueue');

        importXlsxFileJob(params, function() {
            expect(descriptorsQueue.enqueue.callCount).to.be.eql(4);
            expect(descriptorsQueue.enqueue.alwaysCalledWith('import')).to.be.true();
            descriptorsQueue.enqueue.restore();
            done();
        });
    });

    it('should handle big data', function(done) {
        var enqueueBackup = descriptorsQueue.enqueue,
            params;

        params = require('../../data/xlsxJobBig.json').params;
        params.xlsBuffer = new bson.Binary(new Buffer(params.xlsBuffer.$binary, 'base64'), +params.xlsBuffer.$type);

        var calls = 0;
        descriptorsQueue.enqueue = function(name, params, cb) {
            calls++;
            cb();
        };

        importXlsxFileJob(params, function() {
            expect(calls).to.be.eql(1880);
            descriptorsQueue.enqueue = enqueueBackup;
            done();
        });
    });

    it('should throw error for empty data', function(done) {
        var enqueueBackup = descriptorsQueue.enqueue,
            params,
            calls;

        params = require('../../data/xlsxEmpty.json').params;
        params.xlsBuffer = new bson.Binary(new Buffer(params.xlsBuffer.$binary, 'base64'), +params.xlsBuffer.$type);

        calls = 0;
        descriptorsQueue.enqueue = function(name, params, cb) {
            calls++;
            cb();
        };

        importXlsxFileJob(params, function() {
            expect(calls).to.be.eql(0);
            descriptorsQueue.enqueue = enqueueBackup;
            done();
        });
    });

    describe('Error handling', function() {
        function getErrorExpector(done, expected) {
            return function(dataOrError) {
                expect(dataOrError).to.be.instanceOf(Error);
                expect(dataOrError.constructor.name).not.to.be.equal('AssertionError');
                expect(dataOrError.message).to.be.eql(expected);
                done();
            };
        }

        it('should return error if params.jobId is not present', function(done) {
            importXlsxFileJob({filepath: 'some_file_path'}, getErrorExpector(done, 'Job id is required'));
        });

        it('should return error if params.uploader is not present', function(done) {
            importXlsxFileJob({
                filepath: 'some_file_path',
                jobId: 'some_job_id'
            }, getErrorExpector(done, 'Uploader info must be present'));
        });

        it('should return error if params.displayName is not present', function(done) {
            importXlsxFileJob({
                filepath: 'some_file_path',
                jobId: 'some_job_id',
                uploader: {}
            }, getErrorExpector(done, 'Display name must be present'));
        });
    });
});
