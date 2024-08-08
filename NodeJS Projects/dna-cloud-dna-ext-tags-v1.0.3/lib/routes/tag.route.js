'use strict';

var tagController = require('../controllers/tag.controller'),
    consts = require('../consts');

module.exports = function(app, middlewares) {
    app
        .route(consts.ROUTING_PREFIX_TAGS)
        .get(middlewares.acl.view, tagController.getTags)
        .post(middlewares.acl.edit, tagController.createTag);

    app
        .route(consts.ROUTING_PREFIX_TAGS_WITH_PARAM)
        .get(middlewares.acl.view, tagController.getTagById)
        .put(middlewares.acl.edit, tagController.updateTagById)
        .delete(middlewares.acl.delete, tagController.removeTagById);
};
