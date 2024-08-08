'use strict';

var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    DnaDescriptorsImportManager = require('../../../lib/DnaDescriptorsImportManager'),
    testConfiguration = require('../../data/config');

chai.use(require('sinon-chai'));

describe('Export descriptors to XLSX worker', function() {
    var xlsxFileWorker,
        xlsxFilesQueue,
        dnaDescriptorsImportManager;

    beforeEach(function() {
        dnaDescriptorsImportManager = new DnaDescriptorsImportManager(testConfiguration);
        xlsxFilesQueue = dnaDescriptorsImportManager.getXlsxFilesQueue();
        xlsxFileWorker = dnaDescriptorsImportManager.xlsxFileWorker;
    });

    it('should exist', function(done) {
        expect(xlsxFileWorker).to.exist();
        done();
    });

    describe('queues', function() {
        it('should be an array', function(done) {
            expect(xlsxFileWorker.queues).to.be.instanceof(Array);
            done();
        });

        it('should not be empty', function(done) {
            expect(xlsxFileWorker.queues).not.to.be.empty();
            done();
        });

        it('should contain descriptors queue', function(done) {
            var queueNames;

            queueNames = xlsxFileWorker.queues.map(function(queue) {
                return queue.name;
            });

            expect(queueNames).to.contain(xlsxFilesQueue.name);
            done();
        });
    });

    describe('callbacks', function() {
        it('should be an object', function(done) {
            expect(xlsxFileWorker.callbacks).to.be.an('object');
            done();
        });

        it('should not be empty', function(done) {
            expect(xlsxFileWorker.callbacks).not.to.be.empty();
            done();
        });

        it('should contain key \'import\'', function(done) {
            expect(xlsxFileWorker.callbacks).to.contain.key('import');
            done();
        });

        describe('callbacks.import', function() {
            it('should exist', function(done) {
                expect(xlsxFileWorker.callbacks.import).to.exist();
                done();
            });
        });

    });

    describe('interval', function() {
        var expected = 5000;

        it('should be ' + expected, function(done) {
            expect(xlsxFileWorker.interval).to.be.eql(expected);
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
                xlsxFileWorker.emit('dequeued', {});
                expect(console.log).to.be.calledWithMatch('Xlsx file dequeued');
                done();
            });
        });

        describe('\'failed\'', function() {
            it('should call console.log with appropriate message', function(done) {
                xlsxFileWorker.emit('failed');
                expect(console.log).to.be.calledWithMatch('Xlsx file worker failed');
                done();
            });
        });

        describe('\'complete\'', function() {
            it('should call console.log with appropriate message', function(done) {
                xlsxFileWorker.emit('complete', {});
                expect(console.log).to.be.calledWithMatch('Xlsx file worker complete');
                done();
            });
        });

        describe('\'error\'', function() {
            it('should call console.log with appropriate message', function(done) {
                var err = {};
                xlsxFileWorker.emit('error', err);
                expect(console.log).to.be.calledWithMatch('Xlsx file worker error');
                expect(console.log).to.be.calledWithMatch(err);
                done();
            });
        });
    });
});
