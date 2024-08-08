'use strict';

var syllabusesController = require('../controllers/syllabuses.server.controller');

module.exports = function(app) {
    app.route('/syllabuses')
        .get(syllabusesController.list);
};
