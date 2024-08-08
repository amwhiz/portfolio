'use strict';

var mongoose = require('mongoose'),
    findOneOrCreate = require('mongoose-find-one-or-create'),
    Schema = mongoose.Schema,
    VerbSchema,
    Bluebird = require('bluebird'),
    VerbModel;

VerbSchema = new Schema(
    {
        id: {
            type: String,
            required: true
        },
        display: {}
    },
    { versionKey: false }
);

VerbSchema.plugin(findOneOrCreate);
VerbModel = mongoose.model('Verb', VerbSchema);

Bluebird.promisifyAll(VerbModel);
Bluebird.promisifyAll(VerbModel.prototype);
VerbModel.findOneOrCreateAsync = Bluebird.promisify(VerbModel.findOneOrCreate);

module.exports.Verb = VerbModel;
