'use strict';

var _ = require('lodash');

function flatFields(object) {
    return _.keys(object);
}

function filterFields(collection, fieldsToFilter) {
    return _.difference(collection, fieldsToFilter);
}

exports.build = function(fieldsFromModel) {
    var fieldsToFilter = ['_id', 'additionalInformation', 'parent', 'path'],
        fieldsToReturn = ['children'];

    return _.union(fieldsToReturn, filterFields(flatFields(fieldsFromModel), fieldsToFilter)).join(' ');
};
