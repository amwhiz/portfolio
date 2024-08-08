'use strict';

var _ = require('lodash'),
    spawn = require('child_process').spawn,
    Bluebird = require('bluebird'),
    fs = require('fs'),
    path = require('path'),
    jsonFile = require('jsonfile'),
    db = require('./db.service'),
    log = require('../../../upc/log'),
    upcLogService = require('../../../upc/services/upclogs.service');

exports.execute = function(req,res, codes, status, logId) {
    log.info('SCRIPTS EXECUTING');
    var self = this;
    var lastRecord = null;
    var seedUpc = codes[0];

    return new Bluebird(function(resolve, reject) {
        var phantom = spawn('phantomjs', ['--ssl-protocol=any', './phantomjs/scripts.js', req.query.product_id, codes.toString()]);
        phantom.stdout.on('data', function(data) {
            lastRecord = data.toString();
            db.upcLog(data, req.query.product_id, status, seedUpc);
        });

        phantom.stderr.on('data', function(data) {
            log.err('stderr: ' + data);
            reject(err);
        });

        phantom.on('close', function(code) {
            upcLogService.updateSeedUpc(lastRecord, req.query.product_id, status, logId)
                .then(function() {
                    resolve();
                });

            log.info('CHILD PROCESS ' + phantom.pid + ' EXIT WITH CODE ' + code);
        });

        phantom.on('error', function(err) {
            log.info('FAILED TO START CHILD PROCESS');
            log.err(err);
            reject(err);
        });
    });
};
