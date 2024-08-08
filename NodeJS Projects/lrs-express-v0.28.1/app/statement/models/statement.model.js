'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    StatementSchema,
    Bluebird = require('bluebird'),
    StatementModel;

StatementSchema = new Schema(
    {
        id: ObjectId,
        name: String,
        lrs: {
            _id: String,
            name: String
        },
        voided: {
            type: Boolean,
            default: false
        },
        statement: {
            id: {
                type: String,
                required: true,
                index: {
                    unique: true
                }
            },
            actor: {
                type: ObjectId,
                ref: 'Actor',
                required: true
            },
            verb: {
                type: ObjectId,
                ref: 'Verb',
                required: true
            },
            object: {
                type: ObjectId,
                ref: 'Object',
                required: true
            },
            result: {},
            context: {},
            timestamp: Date,
            stored: Date,
            authority: {
                type: ObjectId,
                ref: 'Actor',
                required: true
            },
            version: String,
            attachments: []
        }
    },
    { versionKey: false }
);

StatementModel = mongoose.model('Statement', StatementSchema);

Bluebird.promisifyAll(StatementModel);
Bluebird.promisifyAll(StatementModel.prototype);

module.exports.Statement = StatementModel;
