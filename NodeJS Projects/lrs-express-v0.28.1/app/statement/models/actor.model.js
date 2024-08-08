'use strict';

var mongoose = require('mongoose'),
    findOneOrCreate = require('mongoose-find-one-or-create'),
    Schema = mongoose.Schema,
    ActorSchema,
    Bluebird = require('bluebird'),
    ActorModel;

ActorSchema = new Schema(
    {
        name: String,
        objectType: String,
        account: {
            homePage: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            }
        }
    },
    { versionKey: false }
);

ActorSchema.plugin(findOneOrCreate);
ActorModel = mongoose.model('Actor', ActorSchema);

Bluebird.promisifyAll(ActorModel);
Bluebird.promisifyAll(ActorModel.prototype);
ActorModel.findOneOrCreateAsync = Bluebird.promisify(ActorModel.findOneOrCreate);

module.exports.Actor = ActorModel;
