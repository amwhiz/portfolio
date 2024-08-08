'use strict';

var validator = {},
    Joibird = require('joibird');

validator.validate = function(tagType) {
    var tagTypeSchema = Joibird
        .object().keys({
            tagTypeId: Joibird.string().uppercase().min(2).max(4),
            tagTypeLabel: Joibird.string().required(),
            tagTypeImportColumn: Joibird.string(),
            tagTypeRole: Joibird.string()
        })
        .options({ convert: false })
        .unknown(true);

    return Joibird
        .validate(tagType, tagTypeSchema)
};

module.exports = validator;
