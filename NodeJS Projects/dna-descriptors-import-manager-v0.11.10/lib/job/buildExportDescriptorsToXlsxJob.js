'use strict';

var xlsx = require('node-xlsx'),
    fs = require('fs'),
    dnaDescriptorToXlsxRow = require('../exportMapper/dnaDescriptorToXlsxRow'),
    prepareWorkbook = require('../exportMapper/prepareWorkbook'),
    Bluebird = require('bluebird'),
    objectPath = require('object-path'),
    _ = require('lodash');

module.exports = function buildExportDescriptorsToXlsxJob(apiClient) {
    function canView(user) {
        return !_.isEmpty(_.intersection(objectPath.get(user, 'roles'), ['owner', 'edit', 'view']));
    }

    function getDescriptors(req) {
        objectPath.set(req, 'query.limit', 999999);
        objectPath.set(req, 'query.offset', 0);

        return apiClient.dnaDescriptorsApiClient.searchDescriptor(req);
    }

    function getTags(req) {
        return apiClient.dnaTagsApiClient.getAllTags(req);
    }

    function getSyllabuses(req) {
        return apiClient.dnaSyllabusApiClient.getSyllabuses(req);
    }

    function getDescriptorStatuses(req) {
        return apiClient.dnaDescriptorStatusApiClient.getDescriptorStatusList(req);
    }

    function genXlsxRows(descriptors, tags, syllabuses, descriptorStatuses) {
        return _.map(descriptors.data, function(descriptor) {
            return dnaDescriptorToXlsxRow.retrieveXlsxRow(descriptor, tags, syllabuses, descriptorStatuses);
        });
    }

    function doExportDescriptorsAsXlsx(params, done) {
        var req = {
            user: params.uploader,
            query: params.query
        };

        return Bluebird
            .props({
                descriptors: getDescriptors(req),
                tags: getTags(req),
                syllabuses: getSyllabuses(req),
                descriptorStatuses: getDescriptorStatuses(req)
            })
            .then(function(result) {
                return genXlsxRows(result.descriptors, result.tags, result.syllabuses, result.descriptorStatuses);
            })
            .then(function(xlsxRows) {
                var workbook = prepareWorkbook(xlsxRows);

                params.rowsCount = xlsxRows.length;

                workbook.save(function(err, filepath) {
                    if (err) {
                        _.set(params, 'ERROR', err);
                        done(err);
                        workbook.cancel();
                    } else {
                        fs.readFile(filepath, function(err, data) {
                            if (err) {
                                _.set(params, 'ERROR', err);
                                done(err);
                            } else {
                                done(null, data);
                            }
                        });
                    }
                });
            })
            .catch(function(err) {
                _.set(params, 'ERROR', err);
                done(err);
            });
    }

    function exportDescriptorsAsXlsx(params, done) {
        if (!params.uploader) {
            throw new Error('Uploader info must be present');
        }

        if (!params.query) {
            throw new Error('Query is required');
        }

        if (!canView(params.uploader)) {
            throw new Error('User does not have view rights');
        }

        doExportDescriptorsAsXlsx(params, done);
    }

    return function(params, done) {
        try {
            exportDescriptorsAsXlsx(params || {}, done);
        } catch (err) {
            _.set(params, 'ERROR', err);
            done(err);
        }
    };
};
