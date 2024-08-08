'use strict';

var _ = require('lodash');

function formatLog(msg) {
	if (_.isObject(msg)) {
		console.log(new Date().toISOString());
		console.log(msg);
	} else {
		var date = new Date().toISOString();
		console.log(date.concat(': ').concat(msg));
	}
}

exports.info = function(msg) {
	formatLog(msg);         
};

exports.warn = function(msg) {
	formatLog(msg);         
};

exports.err = function(msg) {
	formatLog(msg);
    console.log('==========================');         
};
