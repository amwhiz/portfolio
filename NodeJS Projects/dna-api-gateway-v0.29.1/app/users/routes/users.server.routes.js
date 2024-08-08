'use strict';

module.exports = function(app) {
    // User Routes
    var users = require('../controllers/users.server.controller');

    // Setting up the users authentication api
    app.route('/auth/signin').post(users.signin);
    app.route('/auth/signout').get(users.signout);
    app.route('/auth/user').get(users.user);
};
