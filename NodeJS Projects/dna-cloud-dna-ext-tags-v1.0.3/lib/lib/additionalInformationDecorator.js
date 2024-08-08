'use strict';

var decorator = {},
    separator = ' ',
    _ = require('lodash');

decorator.decorate = function(objToDecorate, fields) {
    var additionalInformation = {};

    fields = fields.split(separator);

    _.forEach(objToDecorate, function(value, key) {
        if (!_.includes(fields, key)) {
            additionalInformation[key] = value;
            delete objToDecorate[key];
        }
    });

    objToDecorate.additionalInformation = additionalInformation;
};

module.exports = decorator;
