'use strict';

var mongoose = require('mongoose'),
    findOneOrCreate = require('mongoose-find-one-or-create'),
    Schema = mongoose.Schema,
    ObjectSchema,
    Bluebird = require('bluebird'),
    ObjectModel;

ObjectSchema = new Schema(
    {
        name: String,
        id: {
            type: String,
            required: true
        },
        objectType: String,
        member: [],
        description: String,
        type: String
    },
    { versionKey: false }
);

ObjectSchema.plugin(findOneOrCreate);
ObjectModel = mongoose.model('Object', ObjectSchema);

Bluebird.promisifyAll(ObjectModel);
Bluebird.promisifyAll(ObjectModel.prototype);
ObjectModel.findOneOrCreateAsync = Bluebird.promisify(ObjectModel.findOneOrCreate);

module.exports.Object = ObjectModel;
