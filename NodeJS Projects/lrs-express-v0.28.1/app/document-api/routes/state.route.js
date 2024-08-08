'use strict';

var stateController = require('../controllers/state');

module.exports = function(app, prefix) {
    prefix = prefix || '';

    app
        .route(prefix + '/activities/state')
        .get(stateController.getStates)
        .post(stateController.createState)
        .put(stateController.updateState)
        .delete(stateController.deleteStates);
};
