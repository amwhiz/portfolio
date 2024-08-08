'use strict';

var configValidator = {},
    joi = require('joi'),
    configSchema;

configSchema = joi
    .object()
    .keys({
        db: joi
            .string()
            .required(),
        api: joi
            .object()
            .required()
    });

configValidator.validate = function(configuration) {
    var validationResults = joi.validate(configuration, configSchema);

    return validationResults.error === null;
};

configValidator.getErrors = function(configuration) {
    var validationResults = joi.validate(configuration, configSchema, {abortEarly: false});

    return (validationResults.error || {}).details || [];
};

module.exports = configValidator;
