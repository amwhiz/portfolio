'use strict';

/*
* Database Connection Service
*/

// NPM modules
var MySQL = require('mysql');
var BlueBird = require('bluebird');

// Variables
var DB;

// module begins
DB = function() {
	// constructor code here
};

// Connection
DB.connection = function(params) {
	var connection = MySQL.createConnection(params);

	// create connection
	connection.connect(function(error) {
		if (error) {
			console.log('Unable to Connect DB: ' + error);
			return false;
		} else {
			console.log('Connected to DB: ' + connection.threadId);
			return connection;
		}
	});

	return connection;
};

// Executing Query
DB.query = function(db, query) {
	return new BlueBird(function(resolve, reject) {
		db.query(query, function(error, rows) {
			if (error) {
				return reject(error)
			} else {
				return resolve(rows);
			}
		});
	});
};

// exporting module
module.exports = DB;
