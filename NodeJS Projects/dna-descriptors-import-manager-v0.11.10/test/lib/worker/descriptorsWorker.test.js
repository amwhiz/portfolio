'use strict';

var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    DnaDescriptorsImportManager = require('../../../lib/DnaDescriptorsImportManager'),
    testConfiguration = require('../../data/config');

chai.use(require('sinon-chai'));

describe('Descriptors worker', function() {
    var descriptorsWorker,
        descriptorsQueue,
        csvFilesWorker,
        dnaDescriptorsImportManager;

    beforeEach(function() {
        dnaDescriptorsImportManager = new DnaDescriptorsImportManager(testConfiguration);
        descriptorsQueue = dnaDescriptorsImportManager.getDescriptorsQueue();
        descriptorsWorker = dnaDescriptorsImportManager.descriptorsWorker;
        csvFilesWorker = dnaDescriptorsImportManager.csvFileWorker;
    });

    it('should exist', function(done) {
        expect(descriptorsWorker).to.exist();
        done();
    });

    describe('queues', function() {
        it('should be an array', function(done) {
            expect(descriptorsWorker.queues).to.be.instanceof(Array);
            done();
        });

        it('should not be empty', function(done) {
            expect(descriptorsWorker.queues).not.to.be.empty();
            done();
        });

        it('should contain descriptors queue', function(done) {
            var queueNames;

            queueNames = descriptorsWorker.queues.map(function(queue) {
                return queue.name;
            });

            expect(queueNames).to.contain(descriptorsQueue.name);
            done();
        });
    });

    describe('callbacks', function() {
        it('should be an object', function(done) {
            expect(descriptorsWorker.callbacks).to.be.an('object');
            done();
        });

        it('should not be empty', function(done) {
            expect(descriptorsWorker.callbacks).not.to.be.empty();
            done();
        });

        it('should contain key \'import\'', function(done) {
            expect(descriptorsWorker.callbacks).to.contain.key('import');
            done();
        });

        describe('callbacks.import', function() {
            it('should exist', function(done) {
                expect(descriptorsWorker.callbacks.import).to.exist();
                done();
            });
        });

    });

    describe('interval', function() {
        var expected = 5000;

        it('should be ' + expected, function(done) {
            expect(descriptorsWorker.interval).to.be.eql(expected);
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
                descriptorsWorker.emit('dequeued', {});
                expect(console.log).to.be.calledWithMatch('Descriptor dequeued');
                done();
            });
        });

        describe('\'failed\'', function() {
            it('should call console.log with appropriate message', function(done) {
                descriptorsWorker.emit('failed');
                expect(console.log).to.be.calledWithMatch('Descriptor worker failed');
                done();
            });
        });

        describe('\'complete\'', function() {
            it('should call console.log with appropriate message', function(done) {
                descriptorsWorker.emit('complete', {});
                expect(console.log).to.be.calledWithMatch('Descriptor worker complete');
                done();
            });
        });

        describe('\'error\'', function() {
            it('should call console.log with appropriate message', function(done) {
                var err = {};
                descriptorsWorker.emit('error', err);
                expect(console.log).to.be.calledWithMatch('Descriptor worker error');
                expect(console.log).to.be.calledWithMatch(err);
                done();
            });
        });

    });
});
