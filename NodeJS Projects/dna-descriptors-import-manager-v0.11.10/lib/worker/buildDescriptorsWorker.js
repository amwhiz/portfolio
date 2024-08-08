'use strict';

var buildImportDescriptorJob = require('../job/buildImportDescriptorJob'),
    queuesNames = require('../queuesNames');

module.exports = function buildDescriptorsWorker(monqClient, apiClient) {
    var worker = monqClient.worker([queuesNames.descriptorsQueue]);

    worker.register({
        import: buildImportDescriptorJob(apiClient)
    });

    worker.on('dequeued', function(data) {
        console.log('Descriptor dequeued', data._id);
    });

    worker.on('failed', function(data) {
        console.log('Descriptor worker failed', data);
    });

    worker.on('complete', function(data) {
        console.log('Descriptor worker complete', data._id);
    });

    worker.on('error', function(err) {
        console.log('Descriptor worker error', err);
    });

    return worker;
};
