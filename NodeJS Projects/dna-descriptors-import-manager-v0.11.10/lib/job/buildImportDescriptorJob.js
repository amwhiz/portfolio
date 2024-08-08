'use strict';

var ParamsMapper = require('../importMapper/ParamsMapper'),
    _ = require('lodash'),
    Bluebird = require('bluebird');

module.exports = function buildImportDescriptorJob(apiClient) {
    function canEdit(user) {
        return !_.isEmpty(_.intersection((user || {}).roles, ['owner', 'edit']));
    }

    function formatErrorMessage(err) {
        if (err.message) {
            return err.message + '';
        }

        var messages = _.reduce(err.errors, function(errorMessages, e) {
            if (e.param && e.msg) {
                errorMessages.push([e.param, e.msg].join(': '));
            }

            return errorMessages;
        }, []);

        if (err.code) {
            messages.push('Error code: ' + err.code);
        }

        return messages.join(', ');
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

    function getDescriptor(req) {
        return apiClient
            .dnaDescriptorsApiClient
            .getDescriptor(req)
            .error(function() {
                return false;
            });
    }

    function createPOSTrequest(params) {
        return {
            user: params.uploader,
            body: params.descriptorToSend
        };
    }

    function decorateWithRelatedDescriptors(params, descriptor) {
        params.descriptorToSend.descriptors = _.map(descriptor.descriptors, 'descriptorId');

        return params;
    }

    function updateDescriptor(params, descriptor) {
        return apiClient
            .dnaDescriptorsApiClient
            .putDescriptor(
                _.extend(createPOSTrequest(decorateWithRelatedDescriptors(params, descriptor)), {params: {descriptorId: _.get(descriptor, 'descriptorId')}}));
    }

    function createDescriptor(params) {
        return apiClient
            .dnaDescriptorsApiClient
            .postDescriptor(createPOSTrequest(params));
    }

    function handleImport(params, callback) {
        var req = {};

        params = params || {};

        _.set(req, 'user', _.get(params, 'uploader'));

        if (!canEdit(req.user)) {
            _.set(params, 'ERROR', new Error('User does not have edit rights'));
            callback(params.ERROR);
            return;
        }

        Bluebird
            .props({
                tagTypes: getTags(req),
                syllabuses: getSyllabuses(req),
                descriptorStatuses: getDescriptorStatuses(req)
            })
            .then(function(result) {
                _.extend(params, result, {errorLog: []});
                params.descriptorToSend = new ParamsMapper(params).retrieveDescriptor();
                delete params.descriptorStatuses;
                delete params.syllabuses;
                delete params.tagTypes;
                _.set(req, 'params', {descriptorId: _.get(params, 'descriptorToSend.descriptiveId')});
                return getDescriptor(req);
            })
            .then(function(descriptor) {
                if (descriptor) {
                    return updateDescriptor(params, descriptor);
                } else {
                    return createDescriptor(params);
                }
            })
            .then(function(data) {
                setTimeout(function() {
                    callback(null, data);
                }, 100);
            })
            .catch(function(err) {
                _.set(params, 'ERROR', err);
                callback(new Error(formatErrorMessage(err)));
            });
    }

    return function(params, callback) {
        try {
            handleImport(params, callback);
        } catch (err) {
            _.set(params, 'ERROR', err);
            callback(err);
        }
    };
};
