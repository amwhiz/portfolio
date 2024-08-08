'use strict';

var buildImportXlsxFileJob = require('../job/buildImportXlsxFileJob'),
    queuesNames = require('../queuesNames'),
    _ = require('lodash');

module.exports = function buildXlsxFilesWorker(monqClient, descriptorsQueue) {
    var worker = monqClient.worker([queuesNames.xlsxFilesQueue]);

    worker.register({
        import: buildImportXlsxFileJob(descriptorsQueue)
    });

    worker.on('dequeued', function(data) {
        _.set(data, 'params.jobId', _.get(data, '_id'));
        console.log('Xlsx file dequeued', _.get(data, 'params.jobId'));
    });

    worker.on('failed', function(data) {
        console.log('Xlsx file worker failed', data);
    });

    worker.on('complete', function(data) {
        console.log('Xlsx file worker complete', data._id);
    });

    worker.on('error', function(err) {
        console.log('Xlsx file worker error', err);
    });

    return worker;
};
