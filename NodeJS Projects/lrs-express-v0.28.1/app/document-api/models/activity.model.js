'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ActivitySchema,
    ObjectId = mongoose.Schema.ObjectId;

ActivitySchema = new Schema(
    {
        lrs: {
            type: ObjectId,
            ref: 'Lrs',
            required: true
        },
        activityId: {
            type: String,
            required: true
        }
    },
    {
        strict: false,
        versionKey: false
    }
);

module.exports.Activity = mongoose.model('Activity', ActivitySchema);
