'use strict';

var statementController = require('../controllers/statement');

module.exports = function(app, prefix) {
    prefix = prefix || '';

    app.route(prefix + '/statements')
        .get(statementController.getStatements)
        .post(statementController.createStatements)
        .put(statementController.createStatement);
};
