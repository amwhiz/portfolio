'use strict';

var tagTypesController = require('../controllers/tagType.controller'),
    consts = require('../consts');

module.exports = function(app, middlewares) {
    app
        .route(consts.ROUTING_PREFIX_TAG_TYPES)
        .get(middlewares.acl.view, tagTypesController.getTagTypes)
        .post(middlewares.acl.edit, tagTypesController.createTagType);

    app
        .route(consts.ROUTING_PREFIX_TAG_TYPES_WITH_PARAM)
        .get(middlewares.acl.view, tagTypesController.getTagTypeById)
        .put(middlewares.acl.edit, tagTypesController.updateTagTypeById)
        .delete(middlewares.acl.delete, tagTypesController.removeTagTypeById);
};
