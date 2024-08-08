'use strict';

var joi = require('joi');

module.exports = joi
    .object()
    .keys({
        oauth: joi
            .object()
            .keys({
                clientId: joi
                    .string()
                    .required(),
                clientSecret: joi
                    .string()
                    .required()
            })
            .required(),
        schema: joi
            .string()
            .regex(/https?/)
            .allow(null, false),
        hostname: joi
            .string()
            .required(),
        port: joi
            .number()
            .min(0)
            .max(65535)
            .allow(null, false),
        pathname: joi
            .string()
            .required(),
        query: joi
            .object()
            .allow(null, false)
            .pattern(/.*/, joi.alternatives([joi.string(), joi.number(), joi.boolean()]))
    });
