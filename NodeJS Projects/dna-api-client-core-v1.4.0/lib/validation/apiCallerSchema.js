'use strict';

var joi = require('joi');

module.exports = joi
    .object()
    .keys({
        get: joi.func().required(),
        post: joi.func().required(),
        put: joi.func().required(),
        del: joi.func().required(),
        head: joi.func().required(),
        patch: joi.func().required(),
        json: joi.func().required(),
        postJson: joi.func().required(),
        putJson: joi.func().required()
    });
