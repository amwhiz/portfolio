'use strict';

var Bluebird = require('bluebird'),
    database = require('../database'),
    _ = require('lodash'),
    log = require('../log');

function searchAbb(upcCode) {
    var sql = 'SELECT COUNT(*) AS total FROM abb_contacts WHERE upc_code = ' + upcCode;
    return database.query(database.abbDB, sql);
}

function searchLog(upcCode) {
    var sql = 'SELECT COUNT(*) AS total FROM upc_code_logs WHERE codes = ' + upcCode;
    return database.query(database.abbDB, sql);
}

exports.searcUPCCode = function(upcCode) {
    return Bluebird.all([
        searchAbb(upcCode),
        searchLog(upcCode)
    ]);
};

exports.scriptStartLog = function() {
	var sql = 'INSERT INTO log_abb_script_runs(name) VALUES(?)';
	return database.queryParams(database.abbDB, sql, ['Default ABB Contacts Checker Script Run']);
};

exports.productLog = function(productId) {
    var sql = 'INSERT INTO log_abb_script_product_checks(product_id, notes) VALUES(?, ?)';
    var params = [productId, 'Main Product Analyzes'];

    return database.queryParams(database.abbDB, sql, params);
};

exports.getSeedByUpc = function(upcCode, parentId) {
    var sql = 'SELECT * FROM log_seed_upc WHERE upc_code = ? AND parent_id = ?';
    var params = [upcCode, parentId];

    return database.queryParams(database.abbDB, sql, params);
};

exports.insertSeedUpc = function(upcCode, parentId) {
    var sql = 'INSERT INTO log_seed_upc(upc_code, parent_id) VALUES(?, ?)';
    var params = [upcCode, parentId];

    return database.queryParams(database.abbDB, sql, params);
};

function deleteFromUpcSeed(parentId, logId) {
    var sql = 'DELETE FROM log_seed_upc WHERE parent_id = ? AND id = ?';
    var params = [parentId, logId];

    return database.queryParams(database.abbDB, sql, params);
}

exports.updateSeedUpc = function(record, parentId, traverse, logId) {
    try {
        record = JSON.parse(record);
    } catch(e) {
        log.info('UPC LOG SERVICE CATCH BLOCK');
        console.log(e);
    }

    console.log('============== LOG SEED UPC UPDATE ===============');
    console.log(record);
    console.log('TRAVERSE: ' + traverse);
    console.log('PARENT ID: ' + parentId);
    console.log('==================================================');

    var message = _.get(record, 'message', null);
    if (!_.isNull(message) && message === 'SERVER_ERROR') {
        return deleteFromUpcSeed(parentId, logId);
    } else {
        var sql = 'UPDATE log_seed_upc SET ';

        if (traverse === 'negative') {
            sql = sql + 'last_min_upc_code = ?, min_completed = ?, min_notes = ? ';
        } else {
            sql = sql + 'last_max_upc_code = ?, max_completed = ?, max_notes = ? ';
        }

        sql = sql + 'WHERE parent_id = ? AND id = ?';

        if (_.isObject(record)) {
            var status = record.maxReached ? 1 : 0;
            var reason = record.reason ? record.reason : 'PROGRESS';

            var params = [record.product_upc_code, status, reason, parentId, logId];
            return database.queryParams(database.abbDB, sql, params);
        } else {
            return Bluebird.resolve();
        }
    }
};
