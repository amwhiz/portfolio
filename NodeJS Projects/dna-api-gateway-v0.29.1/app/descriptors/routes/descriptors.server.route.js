'use strict';

var descriptors = require('../controllers/descriptors.server.controller');

module.exports = function(app) {
    app.route('/descriptors')
        .get(descriptors.search)
        .post(descriptors.create);

    app.route('/descriptors/:descriptorId')
        .get(descriptors.getDescriptorById)
        .delete(descriptors.removeDescriptorById)
        .put(descriptors.update);

    app.route('/descriptors/:descriptorId/history')
        .get(descriptors.history);
};
