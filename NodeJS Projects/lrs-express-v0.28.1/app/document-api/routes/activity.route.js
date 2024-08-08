'use strict';

var activityController = require('../controllers/activity');

module.exports = function(app, prefix) {
    prefix = prefix || '';

    app
        .route(prefix + '/activities')
        .get(activityController.getActivity);

    app
        .route(prefix + '/activities/profile')
        .get(activityController.getProfiles)
        .post(activityController.createProfile)
        .put(activityController.updateProfile)
        .delete(activityController.deleteProfiles);
};
