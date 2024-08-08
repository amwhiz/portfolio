'use strict';

var validator = {},
    Joibird = require('joibird');

validator.validate = function(tag) {
    var tagSchema = Joibird
        .object().keys({
            tagId: Joibird.string().regex(/^[A-Z]{2,4}\d{5}$/).required(),
            tagLabel: Joibird.string().required(),
            isDeprecated: Joibird.boolean(),
            tagTypeId: Joibird.string().uppercase().min(2).max(4).required()
        })
        .options({convert: false})
        .unknown(true);

    return Joibird
        .validate(tag, tagSchema)
};

module.exports = validator;
