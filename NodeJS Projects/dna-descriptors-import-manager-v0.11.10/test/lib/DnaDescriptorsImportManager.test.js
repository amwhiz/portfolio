'use strict';

var _ = require('lodash'),
    chai = require('chai'),
    sinon = require('sinon'),
    expect = chai.expect,
    testConfiguration = require('../data/config'),
    DnaDescriptorsImportManager = require('../../lib/DnaDescriptorsImportManager');

describe('Job manager', function() {
    var dnaDescriptorsImportManager,
        configuration;

    before(function() {
        configuration = _.cloneDeep(testConfiguration);
        chai.use(require('dirty-chai'));
    });

    beforeEach(function() {
        dnaDescriptorsImportManager = new DnaDescriptorsImportManager(testConfiguration);
    });

    it('should exist', function(done) {
        expect(dnaDescriptorsImportManager).to.exist();
        done();
    });

    it('should throw if configuration is invalid', function(done) {
        expect(function() {
            new DnaDescriptorsImportManager({});
        }).to.throw();
        done();
    });

    describe('method', function() {
        describe('getWorkers', function() {
            it('should exist and be a function', function(done) {
                expect(dnaDescriptorsImportManager.getWorkers).to.exist();
                expect(dnaDescriptorsImportManager.getWorkers).to.be.instanceOf(Function);
                done();
            });

            it('should return array', function(done) {
                expect(dnaDescriptorsImportManager.getWorkers()).to.be.instanceof(Array);
                done();
            });
        });

        describe('start', function() {
            it('should exist and be a function', function(done) {
                expect(dnaDescriptorsImportManager.start).to.exist();
                expect(dnaDescriptorsImportManager.start).to.be.instanceOf(Function);
                done();
            });

            it('should call start from all workers', function(done) {
                var worker1 = {start: sinon.spy()},
                    worker2 = {start: sinon.spy()};

                dnaDescriptorsImportManager.getWorkers = sinon.stub().returns([worker1, worker2]);

                expect(worker1.start.called).to.be.false();
                expect(worker2.start.called).to.be.false();

                dnaDescriptorsImportManager.start();

                expect(worker1.start.calledOnce).to.be.true();
                expect(worker2.start.calledOnce).to.be.true();

                done();
            });
        });

        describe('stop', function() {
            it('should exist and be a function', function(done) {
                expect(dnaDescriptorsImportManager.stop).to.exist();
                expect(dnaDescriptorsImportManager.stop).to.be.instanceOf(Function);
                done();
            });

            it('should call stop from all workers', function(done) {
                var worker1 = {stop: sinon.spy()},
                    worker2 = {stop: sinon.spy()};

                dnaDescriptorsImportManager.getWorkers = sinon.stub().returns([worker1, worker2]);

                expect(worker1.stop.called).to.be.false();
                expect(worker2.stop.called).to.be.false();

                dnaDescriptorsImportManager.stop();

                expect(worker1.stop.calledOnce).to.be.true();
                expect(worker2.stop.calledOnce).to.be.true();

                done();
            });
        });

        describe('getDescriptorsQueue', function() {
            it('should exist and be a function', function(done) {
                expect(dnaDescriptorsImportManager.getDescriptorsQueue).to.exist();
                expect(dnaDescriptorsImportManager.getDescriptorsQueue).to.be.instanceOf(Function);
                done();
            });

            it('should return descriptors queue', function(done) {
                var queue = dnaDescriptorsImportManager.getDescriptorsQueue();
                expect(queue.name).to.be.equal('descriptors');
                done();
            });
        });

        describe('getDescriptorsExportToXlsxQueue', function() {
            it('should exist and be a function', function(done) {
                expect(dnaDescriptorsImportManager.getDescriptorsExportToXlsxQueue).to.exist();
                expect(dnaDescriptorsImportManager.getDescriptorsExportToXlsxQueue).to.be.instanceOf(Function);
                done();
            });

            it('should return descriptors queue', function(done) {
                var queue = dnaDescriptorsImportManager.getDescriptorsExportToXlsxQueue();
                expect(queue.name).to.be.equal('descriptors_export_to_xlsx');
                done();
            });
        });
    });
});
