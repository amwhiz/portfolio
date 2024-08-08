'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    DocumentSchema,
    DocumentModel,
    Bluebird = require('bluebird');

DocumentSchema = new Schema(
    {
        lrs: {
            type: Schema.ObjectId,
            ref: 'Lrs',
            required: true
        },
        documentType: String,
        content: String,
        contentType: String,
        stateId: {
            type: String,
            required: false
        },
        profileId: {
            type: String,
            required: false
        },
        createdAt: Date,
        activityId: {
            type: String,
            required: false
        },
        updatedAt: Date
    },
    {
        strict: false,
        versionKey: false
    }
);

DocumentSchema.pre('save', function(next) {
    var now = new Date();

    this.updatedAt = now;

    if (!this.createdAt) {
        this.createdAt = now;
    }

    next();
});

DocumentModel = mongoose.model('Document', DocumentSchema);

Bluebird.promisifyAll(DocumentModel);
Bluebird.promisifyAll(DocumentModel.prototype);

module.exports.Document = DocumentModel;
