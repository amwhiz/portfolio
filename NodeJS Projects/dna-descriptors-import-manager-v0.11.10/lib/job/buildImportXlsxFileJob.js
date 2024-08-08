'use strict';

var xlsx = require('node-xlsx'),
    objectPath = require('object-path'),
    HEADERS_ROW_NUM = 1, //second row contains headers
    FIRST_DATA_ROW_NUM = 2, // data start from third row
    _ = require('lodash');

module.exports = function buildImportXlsxFileJob(descriptorsQueue) {
    var errors = [];

    function enqueueDescriptor(descriptorData, params, done) {
        var jobParams = {};

        jobParams.descriptor = descriptorData;
        jobParams.parentJobId = params.jobId;
        jobParams.displayName = params.displayName;
        jobParams.sheetName = params.sheetName;
        jobParams.uploader = params.uploader;

        descriptorsQueue
            .enqueue('import', jobParams, function(err) {
                err && errors.push(err); // jshint ignore:line

                if (done) {
                    _.isEmpty(errors) ? done() : done(errors); // jshint ignore:line
                }
            });
    }

    function getSheetByNameOrNum(xls, sheetInfo) {
        var sheetName = objectPath.get(sheetInfo, 'name'),
            sheetNum = objectPath.get(sheetInfo, 'num', 0),
            sheetFoundByName;

        sheetFoundByName = _.find(xls, function(sheet) {
            return sheet.name === sheetName;
        });

        return sheetFoundByName || xls[sheetNum];
    }

    function doImportXlsxFile(params, done) {
        var xls = xlsx.parse(params.xlsBuffer.buffer),
            sheet = getSheetByNameOrNum(xls, objectPath.get(params, 'sheet', {})),
            descriptorJobParams,
            rows = objectPath.get(sheet, 'data', []),
            headers = objectPath.get(rows, HEADERS_ROW_NUM, []),
            rowNum = FIRST_DATA_ROW_NUM;

        descriptorJobParams = {
            sheetName: objectPath.get(sheet, 'name'),
            jobId: params.jobId,
            displayName: params.displayName,
            uploader: params.uploader
        };

        if (_.isEmpty(objectPath.get(sheet, 'data', []))) {
            throw new Error('File is empty');
        }

        for (rowNum; rowNum < rows.length; rowNum++) {
            var doneIfLast = (rowNum === rows.length - 1) ? done : null;

            enqueueDescriptor(_.zipObject(headers, rows[rowNum]), descriptorJobParams, doneIfLast);
        }
    }

    function importXlsxFile(params, done) {
        if (!params.jobId) {
            throw new Error('Job id is required');
        }

        if (!params.uploader) {
            throw new Error('Uploader info must be present');
        }

        if (!params.displayName) {
            throw new Error('Display name must be present');
        }

        doImportXlsxFile(params, done);
    }

    return function(params, done) {
        try {
            importXlsxFile(params || {}, done);
        } catch (err) {
            _.set(params, 'ERROR', err);
            done(err);
        }
    };
};
