'use strict';

var init = require('./config/init')(),
    config = require('./config/config'),
    mongoose = require('mongoose'),
    http,
    db,
    app;

db = mongoose.connect(config.db, function(err) {
    if (err) {
        console.error('\x1b[31m', 'Could not connect to MongoDB!');
        console.log(err);
    }
});

mongoose.connection.on('connected', function() {
    app = require('./config/express')(db);
    http = require('http').Server(app);
    http.listen(config.port);
    require('./config/passport')();
    console.log('MEAN.JS application started on port ' + config.port);
});
