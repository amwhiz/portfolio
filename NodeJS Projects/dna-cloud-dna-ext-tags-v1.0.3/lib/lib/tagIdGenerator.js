'use strict';

var generator = {},
    _ = require('lodash'),
    errors = require('../errors/errors');

function increaseId(lastId, tagTypeId) {
    var escapedId = _.parseInt(lastId.replace(tagTypeId, ''));

    return _.padLeft(++escapedId, 5, '0');
}

generator.generateId = function(tagTypeId, lastId) {
    if (_.isEmpty(tagTypeId)) {
        throw new errors.MissingTagTypeError();
    }

    if (_.isEmpty(lastId)) {
        return tagTypeId + '00001';
    }

    return tagTypeId + increaseId(lastId, tagTypeId);
};

module.exports = generator;
