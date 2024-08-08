'use strict';

var service = {},
    db = require('../lib/dbStorage'),
    mongoose = db.getDb(),
    TagType = mongoose.model('TagTypeExt'),
    additionalInformationDecorator = require('../lib/additionalInformationDecorator'),
    fieldsToReturnBuilder = require('../lib/fieldsToReturnBuilder'),
    fieldsToReturn = fieldsToReturnBuilder.build(TagType.schema.paths),
    createQuery;

createQuery = function(tagTypeId) {
    return {
        tagTypeId: tagTypeId
    };
};

service.getTagTypes = function() {
    return TagType
        .findAsync({}, fieldsToReturn);
};

service.getTagTypeById = function(tagTypeId) {
    return TagType
        .findOneAsync(createQuery(tagTypeId), fieldsToReturn);
};

service.createTagType = function(document) {
    additionalInformationDecorator.decorate(document, fieldsToReturn);

    return TagType
        .createAsync(document);
};

service.updateTagTypeById = function(tagTypeId, document) {
    return TagType
        .findOneAndUpdateAsync(createQuery(tagTypeId), document);
};

service.removeTagTypeById = function(tagTypeId) {
    return TagType
        .removeAsync(createQuery(tagTypeId));
};

module.exports = service;
