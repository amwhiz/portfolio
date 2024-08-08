'use strict';

var buildExportDescriptorsToXlsxJob = require('../job/buildExportDescriptorsToXlsxJob'),
    queuesNames = require('../queuesNames');

module.exports = function buildExportDescriptorsToXlsxWorker(monqClient, apiClient) {
    var worker = monqClient.worker([queuesNames.exportDescriptorsAsXlsx]);

    worker.register({
        export: buildExportDescriptorsToXlsxJob(apiClient)
    });

    worker.on('dequeued', function(data) {
        console.log('Descriptors xlsx export dequeued', data._id);
    });

    worker.on('failed', function(data) {
        console.log('Descriptors xlsx export worker failed', data);
    });

    worker.on('complete', function(data) {
        console.log('Descriptors xlsx export worker complete', data._id);
    });

    worker.on('error', function(err) {
        console.log('Descriptors xlsx export worker error', err);
    });

    return worker;
};
