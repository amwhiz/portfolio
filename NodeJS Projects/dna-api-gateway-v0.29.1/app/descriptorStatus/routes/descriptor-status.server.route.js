'use strict';

var descriptorStatusController = require('../controllers/descriptor-status.server.controller.js');

module.exports = function(app) {
    app.route('/descriptorStatus')
        .get(descriptorStatusController.list);

    app.route('/defaultDescriptorStatuses')
        .get(descriptorStatusController.defaultStatuses);
};
