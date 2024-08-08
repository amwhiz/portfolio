'use strict';

var safeAccess = require('safe-access'),
    exist = require('../helpers/exist.helper.js'),
    _ = require('lodash'),
    attachments,
    validator = require('../../validator/validator');

module.exports = function(statement) {
    var errors = [];

    if (exist(safeAccess(statement, 'attachments'))) {
        errors = errors.concat(validator.check(statement, 'attachments', [
            {rule: 'isArray'}
        ]));

        attachments = safeAccess(statement, 'attachments');
        _.forEach(attachments, function(element) {
            errors = errors.concat(validator.check(element, 'usageType', [
                {rule: 'isURL'}
            ]));

            errors = errors.concat(validator.check(element, 'display', [
                {rule: 'isArray'}
            ]));

            errors = errors.concat(validator.check(element, 'length', [
                {rule: 'isInt'}
            ]));

            errors = errors.concat(validator.check(element, 'sha2', [
                {rule: 'isBase64'}
            ]));

            if (exist(safeAccess(element, 'description'))) {
                errors = errors.concat(validator.check(element, 'description', [
                    {rule: 'isArray'}
                ]));
            }

            if (exist(safeAccess(element, 'contentType'))) {
                errors = errors.concat(validator.check(element, 'contentType', [
                    {rule: 'isContentType'}
                ]));
            }

            if (exist(safeAccess(element, 'fileUrl'))) {
                errors = errors.concat(validator.check(element, 'fileUrl', [
                    {rule: 'isURL'}
                ]));
            }
        });
    }

    return errors;
};
