'use strict';

var access = require('safe-access');

module.exports = function(req) {
    return access(req, 'lrs._id.toString()');
};
