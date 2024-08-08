'use strict';

var db = require('../lib/dbStorage'),
    mongoose = db.getDb(),
    Mixed = mongoose.Schema.Types.Mixed,
    Bluebird = require('bluebird'),
    errors = require('../errors/errors'),
    modelService = require('../services/model.service'),
    TagTypeSchema,
    TagTypeModel;

TagTypeSchema = new mongoose.Schema({
        tagTypeId: {
            type: String,
            required: true,
            index: {
                unique: true
            }
        },
        tagTypeLabel: {
            type: String,
            required: true
        },
        tagTypeImportColumn: {
            type: String,
            default: null
        },
        tagTypeRole: {
            type: String,
            default: null
        },
        isVisible: {
            type: Boolean,
            default: true
        },
        additionalInformation: {
            type: Mixed
        }
    },
    {
        versionKey: false
    });

TagTypeSchema.pre('save', function(next) {
    var self = this;

    if (self.isNew) {
        modelService.checkForDuplicate(TagTypeModel, errors.DuplicatedTagTypeError, 'tagTypeId', self, next);
    }
});

TagTypeModel = mongoose.model('TagTypeExt', TagTypeSchema);

Bluebird.promisifyAll(TagTypeModel);
Bluebird.promisifyAll(TagTypeModel.prototype);

module.exports = TagTypeModel;
