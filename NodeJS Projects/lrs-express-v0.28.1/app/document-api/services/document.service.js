'use strict';

var DocumentModel = require('mongoose').model('Document'),
    _ = require('lodash'),
    InvalidContentError = require('../errors/InvalidContent.error'),
    Bluebird = require('bluebird'),
    contentTypes = require('../lib/content-types/content-types'),
    Multiparty = require('multiparty'),
    config = require('../../../config/config'),
    fs = require('fs'),
    uploadDir = __dirname + '/../../../' + config.uploadDir + '/',
    uuid = require('node-uuid'),
    guessType = require('guess-content-type'),
    agentTypes = require('../lib/agent-types/agent-types'),
    path = require('path'),
    getDocument,
    fieldsToDrop = '-_id -createdAt -updatedAt -lrs -documentType',
    getDocuments,
    createDocument,
    updateDocument;

createDocument = function(queryParams, content, contentType) {
    var document = new DocumentModel(queryParams);

    document.content = content;
    document.contentType = contentType;

    return document.saveAsync();
};

updateDocument = function(data, content, contentType, merge) {
    if (!merge) {
        data.content = content;
    } else if (_.contains(contentType, contentTypes.JSON)) {
        data.content = _.extend(data.content, content);
    } else {
        throw new InvalidContentError(content);
    }

    return data.saveAsync();
};

exports.createOrUpdateDocument = function(queryParams, content, contentType, merge) {
    return getDocument(queryParams)
        .then(function(data) {
            if (_.isEmpty(data)) {
                return createDocument(queryParams, content, contentType);
            }

            return updateDocument(data, content, contentType, merge);
        });
};

exports.removeFile = function(file) {
    fs.exists(file, function(exists) {
        if (exists) {
            fs.unlink(file);
        }
    });
};

exports.saveFile = function(fileFromRequest) {
    var fileToSave = uploadDir + uuid.v1() + path.extname(fileFromRequest.originalFilename),
        readStream,
        writeStream;

    return new Bluebird(function(resolve, reject) {
        fs.exists(fileFromRequest.path, function(exists) {
            if (exists) {
                readStream = fs.createReadStream(fileFromRequest.path);
                writeStream = fs.createWriteStream(fileToSave);
                readStream.pipe(writeStream);
                writeStream.end(function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve([path.basename(fileToSave), guessType(fileToSave)]);
                    }
                });
            } else {
                reject(new Error());
            }
        });

    });
};

exports.flatParams = function(params) {
    return _.mapValues(params, function(value) {
        return value.pop();
    });
};

exports.parseForm = function(req) {
    return new Bluebird(function(resolve, reject) {
        var form = new Multiparty.Form();

        form.parse(req, function(err, fields, files) {
            if (err) {
                reject(err);
            } else {
                resolve([fields, files]);
            }
        });
    });
};

exports.getDocument = function(query, field) {
    if (_.has(query, field)) {
        return getDocument(query, fieldsToDrop);
    }

    return getDocuments(query, field);
};

getDocuments = function(query, fields) {
    return DocumentModel
        .findAsync(query, fields);
};

getDocument = function(query, fields) {
    return DocumentModel
        .findOneAsync(query, fields || '');
};

exports.deleteDocument = function(query) {
    return DocumentModel
        .removeAsync(query);
};

exports.getAgents = Bluebird.method(function(parsedData) {
    return _.reduce(agentTypes, function(obj, key) {
        if (_.has(parsedData.agent, key)) {
            obj[key] = [parsedData.agent[key]];
        }

        return obj;
    }, {objectType: 'Person'});
});
