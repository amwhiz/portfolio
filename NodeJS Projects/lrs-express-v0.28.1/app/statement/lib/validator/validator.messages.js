'use strict';

var messages = {
    REQUIRED: function(fieldName) {
        return {
            fieldName: fieldName,
            message: 'required'
        };
    },
    OBJECT: function(fieldName) {
        return {
            fieldName: fieldName,
            message: 'must be Object'
        };
    },
    STRING: function(fieldName) {
        return {
            fieldName: fieldName,
            message: 'must be String'
        };
    },
    NUMBER: function(fieldName) {
        return {
            fieldName: fieldName,
            message: 'must be Number'
        };
    },
    INTEGER: function(fieldName) {
        return {
            fieldName: fieldName,
            message: 'must be Integer'
        };
    },
    BASE64: function(fieldName) {
        return {
            fieldName: fieldName,
            message: 'must be Base64'
        };
    },
    CONTENT_TYPE: function(fieldName) {
        return {
            fieldName: fieldName,
            message: 'must be a Content Type'
        };
    },
    IRI: function(fieldName) {
        return {
            fieldName: fieldName,
            message: 'must be an IRI'
        };
    },
    VALUE: function(fieldName, value) {
        return {
            fieldName: fieldName,
            message: 'must be equal ' + value
        };
    },
    RANGE: function(fieldName, range) {
        range = range || [];
        return {
            fieldName: fieldName,
            message: 'must be equal one from range: ' + range.join(', ')
        };
    },
    UUID: function(fieldName) {
        return {
            fieldName: fieldName,
            message: 'must be an UUID'
        };
    },
    NOT_EXIST: function(fieldName) {
        return {
            fieldName: fieldName,
            message: 'must not exist'
        };
    },
    NOT_STARTS: function(fieldName, value) {
        return {
            fieldName: fieldName,
            message: 'must starts with ' + value
        };
    },
    ISO8601: function(fieldName) {
        return {
            fieldName: fieldName,
            message: 'must be valid ISO 8601 time format'
        };
    },
    BOOL: function(fieldName) {
        return {
            fieldName: fieldName,
            message: 'must be Boolean'
        };
    },
    BETWEEN: function(fieldName, options) {
        return {
            fieldName: fieldName,
            message: 'must be between: ' + options.min + ' and ' + options.max
        };
    },
    BIGGER: function(fieldName, min) {
        return {
            fieldName: fieldName,
            message: 'must be bigger than ' + min
        };
    },
    SMALLER: function(fieldName, max) {
        return {
            fieldName: fieldName,
            message: 'must be smaller than ' + max
        };
    },
    IS_NOT: function(fieldName, value) {
        return {
            fieldName: fieldName,
            message: 'must not be ' + value
        };
    },
    ARRAY: function(fieldName) {
        return {
            fieldName: fieldName,
            message: 'must not be an Array'
        };
    },
    JSON: function(fieldName) {
        return {
            fieldName: fieldName,
            message: 'must not be an JSON'
        };
    }
};

module.exports = messages;
