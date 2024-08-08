'use strict';

var configValidator = require('./configValidator'),
    DnaDescriptorsImportManager,
    monq = require('monq'),
    buildXlsxFilesWorker = require('./worker/buildXlsxFilesWorker'),
    buildDescriptorsWorker = require('./worker/buildDescriptorsWorker'),
    buildExportDescriptorsAsXlsxWorker = require('./worker/buildExportDescriptorsAsXlsxWorker'),
    DnaApiClient = require('dna-api-client'),
    queuesNames = require('./queuesNames');

DnaDescriptorsImportManager = function(configuration) {
    if (!configValidator.validate(configuration)) {
        throw new Error('Configuration is invalid');
    }

    this.configuration = configuration;

    this.monqClient = monq(this.configuration.db);
    this.apiClient = new DnaApiClient(this.configuration.api);

    this.xlsxFilesQueue = this.buildQueue(queuesNames.xlsxFilesQueue);
    this.descriptorsQueue = this.buildQueue(queuesNames.descriptorsQueue);
    this.exportDescriptorsAsXlsx = this.buildQueue(queuesNames.exportDescriptorsAsXlsx);

    this.xlsxFileWorker = buildXlsxFilesWorker(this.monqClient, this.descriptorsQueue);
    this.descriptorsWorker = buildDescriptorsWorker(this.monqClient, this.apiClient);
    this.exportDescriptorsAsXlsxWorker = buildExportDescriptorsAsXlsxWorker(this.monqClient, this.apiClient);
};

DnaDescriptorsImportManager.prototype.buildQueue = function(name) {
    return this.monqClient.queue(name, {
        collection: 'jobs'
    });
};

DnaDescriptorsImportManager.prototype.getWorkers = function() {
    return [this.descriptorsWorker, this.xlsxFileWorker, this.exportDescriptorsAsXlsxWorker];
};

DnaDescriptorsImportManager.prototype.start = function() {
    this.getWorkers()
        .forEach(function(worker) {
            worker.start();
        });
};

DnaDescriptorsImportManager.prototype.stop = function() {
    this.getWorkers()
        .forEach(function(worker) {
            worker.stop();
        });
};

DnaDescriptorsImportManager.prototype.getXlsxFilesQueue = function() {
    return this.xlsxFilesQueue;
};

DnaDescriptorsImportManager.prototype.getDescriptorsQueue = function() {
    return this.descriptorsQueue;
};

DnaDescriptorsImportManager.prototype.getDescriptorsExportToXlsxQueue = function() {
    return this.exportDescriptorsAsXlsx;
};

module.exports = DnaDescriptorsImportManager;
