'use strict';

var agentController = require('../controllers/agent');

module.exports = function(app, prefix) {
    prefix = prefix || '';

    app
        .route(prefix + '/agents')
        .get(agentController.getAgents);

    app
        .route(prefix + '/agents/profile')
        .get(agentController.getProfiles)
        .post(agentController.createProfile)
        .put(agentController.updateProfile)
        .delete(agentController.deleteProfiles);
};
