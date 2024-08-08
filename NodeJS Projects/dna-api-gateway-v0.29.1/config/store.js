'use strict';

var session = require('express-session'),
    MongoStore = require('connect-mongo')({
        session: session
    }),
    config = require('./config'),
    dbReference,
    storeInstance;

module.exports = {
    setDb: function(db) {
        if (!dbReference) {
            dbReference = db;
        } else {
            throw(new Error('Database already set'));
        }
    },
    getStore: function() {
        if (!storeInstance) {
            if (!dbReference) {
                throw(new Error('Please set database first'));
            }
            storeInstance = new MongoStore({
                db: dbReference.connection.db,
                collection: config.sessionCollection
            });
        }

        return storeInstance;
    }
};
