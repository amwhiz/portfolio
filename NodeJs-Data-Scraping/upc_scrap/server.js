'use strict';

/*
* Initialize the application and start the server
*/

// NPM Modules
var _ = require('lodash');
var chalk = require('chalk');
var mysql = require('mysql');

// application settings
var settings = require('./settings');

// NODE Environmental Variables
process.env.UPC_ENVIRONMENT = process.env.UPC_ENVIRONMENT || settings.environment;
process.env.UPC_PORT = process.env.UPC_PORT || settings.port;

// application configuration
var config = require('./config/config');

// database connection
var dbConfig = config.config.database;
var connection = mysql.createConnection({
    host: dbConfig.hostname,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database
});

connection.connect(function(error) {
    if (error) {
        console.log('Could Not Connect to Database: ');
        console.log(error);
    } else {
        // app initialization
        var app = require('./config/app')(connection);

        // starting server
        app.listen(process.env.UPC_PORT);

        // exporting module
        exports = module.exports = app;

        // Logging initialization
        console.log('--------------------------------');
        console.log(chalk.green('UPC Application started'));
        console.log(chalk.green('Environment:\t\t\t' + process.env.UPC_ENVIRONMENT));
        console.log(chalk.green('Port:\t\t\t\t' + process.env.UPC_PORT));
        console.log(chalk.green('Database:\t\t\t' + dbConfig.database));
        console.log('--------------------------------');
    }
})
