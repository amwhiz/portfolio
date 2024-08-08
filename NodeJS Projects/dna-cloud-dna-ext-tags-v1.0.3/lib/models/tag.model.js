'use strict';

var db = require('../lib/dbStorage'),
    mongoose = db.getDb(),
    Mixed = mongoose.Schema.Types.Mixed,
    Bluebird = require('bluebird'),
    errors = require('../errors/errors'),
    modelService = require('../services/model.service'),
    tree = require('mongoose-path-tree'),
    TagSchema,
    TagModel;

TagSchema = new mongoose.Schema({
        tagId: {
            type: String,
            required: true
        },
        tagLabel: {
            type: String,
            required: true
        },
        isDeprecated: {
            type: Boolean,
            default: false
        },
        tagTypeId: {
            type: String,
            required: true
        },
        additionalInformation: {
            type: Mixed
        }
    },
    {
        versionKey: false
    });

TagSchema.plugin(tree);

TagSchema.index({tagId: 1, tagTypeId: 1}, {unique: true});

TagSchema.pre('save', function(next) {
    var self = this,
        query;

    query = {
        tagTypeId: self.tagTypeId
    };

    if (self.isNew) {
        modelService.checkForDuplicate(TagModel, errors.DuplicatedTagError, 'tagId', self, next, query);
    }
});

TagModel = mongoose.model('TagExt', TagSchema);

Bluebird.promisifyAll(TagModel);
Bluebird.promisifyAll(TagModel.prototype);

module.exports = TagModel;
