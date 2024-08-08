'use strict';

var tags = require('../controllers/tags.server.controller');

module.exports = function(app) {
    app.route('/tags')
        .get(tags.list);

    app.route('/tags/gse')
        .get(tags.gse);

    app.route('/tags/skill')
        .get(tags.skill);

    app.route('/ext/tags')
        .get(tags.getExtTags)
        .post(tags.postExtTag);

    app.route('/ext/tags/:tagId')
        .get(tags.getExtTag)
        .put(tags.putExtTag)
        .delete(tags.deleteExtTag);

    app.route('/ext/tagTypes')
        .get(tags.getExtTagTypes)
        .post(tags.postExtTagType);

    app.route('/ext/tagTypes/:tagTypeId')
        .get(tags.getExtTagType)
        .put(tags.putExtTagType)
        .delete(tags.deleteExtTagType);
};
