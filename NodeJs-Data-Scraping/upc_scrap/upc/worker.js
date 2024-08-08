'use strict';

/*
* Monitoring the output of Phantom JS Scripts
*/

// NPM modules
var watch = require('watch');

// creating monitoring process for files directory
watch.createMonitor('files/', function(monitor) {
	console.log('Monitoring the Files directory: ');

	// handling the new file
	monitor.on('created', function(file, status) {
		console.log('New File: ' + file);
		var productDetails = require('.././' + file);
	});

	// handling the file changes
	monitor.on('changed', function(file, current, previous) {
		console.log('File Changed: ' + file);
	});

	// handling the file deletion
	monitor.on('removed', function(file, status) {
		console.log('File :' + file + ' has been removed.');
	}); 
});
