'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    ObjectId = mongoose.Schema.ObjectId,
    LrsSchema;

LrsSchema = new Schema({
    title: { type: String, required: true, unique: true },
    description: { type: String, required: false, unique: false },
    api: {}
});

LrsSchema.pre('save', function(next) {
    var _this = this;
    crypto.randomBytes(20, function(ex, basicKeyBuf) {
        crypto.randomBytes(20, function(ex1, basicSecretBuf) {
            _this.api = {
                basicKey: basicKeyBuf.toString('hex'), basicSecret: basicSecretBuf.toString('hex')
            };
            next();
        });
    });
});

module.exports.Lrs = mongoose.model('Lrs', LrsSchema);
