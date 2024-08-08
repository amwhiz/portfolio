'use strict';

var storage = {},
    db;

storage.getDb = function() {
    return db;
};

storage.setDb = function(database) {
    db = database
};

module.exports = storage;
