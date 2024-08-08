'use strict';

var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    DnaDescriptorsImportManager = require('../../../lib/DnaDescriptorsImportManager'),
    testConfiguration = require('../../data/config');

chai.use(require('sinon-chai'));

describe('Export descriptors to XLSX worker', function() {
    var exportDescriptorsAsXlsxWorker,
        exportDescriptorsToXlsxQueue,
        dnaDescriptorsImportManager;

    beforeEach(function() {
        dnaDescriptorsImportManager = new DnaDescriptorsImportManager(testConfiguration);
        exportDescriptorsToXlsxQueue = dnaDescriptorsImportManager.getDescriptorsExportToXlsxQueue();
        exportDescriptorsAsXlsxWorker = dnaDescriptorsImportManager.exportDescriptorsAsXlsxWorker;
    });

    it('should exist', function(done) {
        expect(exportDescriptorsAsXlsxWorker).to.exist();
        done();
    });

    describe('queues', function() {
        it('should be an array', function(done) {
            expect(exportDescriptorsAsXlsxWorker.queues).to.be.instanceof(Array);
            done();
        });

        it('should not be empty', function(done) {
            expect(exportDescriptorsAsXlsxWorker.queues).not.to.be.empty();
            done();
        });

        it('should contain descriptors queue', function(done) {
            var queueNames;

            queueNames = exportDescriptorsAsXlsxWorker.queues.map(function(queue) {
                return queue.name;
            });

            expect(queueNames).to.contain(exportDescriptorsToXlsxQueue.name);
            done();
        });
    });

    describe('callbacks', function() {
        it('should be an object', function(done) {
            expect(exportDescriptorsAsXlsxWorker.callbacks).to.be.an('object');
            done();
        });

        it('should not be empty', function(done) {
            expect(exportDescriptorsAsXlsxWorker.callbacks).not.to.be.empty();
            done();
        });

        it('should contain key \'export\'', function(done) {
            expect(exportDescriptorsAsXlsxWorker.callbacks).to.contain.key('export');
            done();
        });

        describe('callbacks.export', function() {
            it('should exist', function(done) {
                expect(exportDescriptorsAsXlsxWorker.callbacks.export).to.exist();
                done();
            });
        });
    });

    describe('interval', function() {
        var expected = 5000;

        it('should be ' + expected, function(done) {
            expect(exportDescriptorsAsXlsxWorker.interval).to.be.eql(expected);
            done();
        });
    });

    describe('listener of event', function() {
        var consoleLogBackup;

        before(function(done) {
            consoleLogBackup = console.log;
            console.log = sinon.spy();
            done();
        });

        after(function(done) {
            console.log = consoleLogBackup;
            done();
        });

        describe('\'dequeued\'', function() {
            it('should call console.log with appropriate message', function(done) {
                exportDescriptorsAsXlsxWorker.emit('dequeued', {});
                expect(console.log).to.be.calledWithMatch('Descriptors xlsx export dequeued');
                done();
            });
        });

        describe('\'failed\'', function() {
            it('should call console.log with appropriate message', function(done) {
                exportDescriptorsAsXlsxWorker.emit('failed');
                expect(console.log).to.be.calledWithMatch('Descriptors xlsx export worker failed');
                done();
            });
        });

        describe('\'complete\'', function() {
            it('should call console.log with appropriate message', function(done) {
                exportDescriptorsAsXlsxWorker.emit('complete', {});
                expect(console.log).to.be.calledWithMatch('Descriptors xlsx export worker complete');
                done();
            });
        });

        describe('\'error\'', function() {
            it('should call console.log with appropriate message', function(done) {
                var err = {};
                exportDescriptorsAsXlsxWorker.emit('error', err);
                expect(console.log).to.be.calledWithMatch('Descriptors xlsx export worker error');
                expect(console.log).to.be.calledWithMatch(err);
                done();
            });
        });
    });
});
