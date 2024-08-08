'use strict';

var DnaApiClient = require('dna-api-client'),
    config = require('../config/config').dnaApi;

module.exports = new DnaApiClient(config);
