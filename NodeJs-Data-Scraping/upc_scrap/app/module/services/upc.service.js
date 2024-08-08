'use strict';

var _ = require('lodash'),
    Bluebird = require('bluebird'),
    db = require('./db.service'),
    Phantom = require('./phantom.service'),
    log = require('../../../upc/log'),
    database = require('../../../upc/services/upclogs.service');

function zeroFill(number, width) {
    width -= number.length;

    if ( width > 0 ) {
        return new Array(width + (/\./.test( number ) ? 2 : 1)).join( '0' ) + number;
    }

    return number + '';
}

function getCode(code) {
    return code.substr(0, code.length - 1);
}

function processUPCCode(code) {
    var sum = 0,
        checksum,
        finalCode;

    for (var i = 0; i < code.length; i++) {
        if (i % 2 === 0) {
            sum += (code[i] * 1);
        } else {
            sum += (code[i] * 3);
        }
    }

    checksum = (sum % 10 !== 0) ? (10 - (sum % 10)) : 0;
    finalCode = parseInt(code.toString().concat(checksum), 10);

    return finalCode;
}

function search(req, res, codes, parentUpc) {
    return db.search(codes[0])
        .then(function(rows) {
            return Bluebird.all([db.searchAbb(codes[0]), rows])
        })
        .spread(function(abbUpc, logUpc) {
            return _.merge(logUpc, abbUpc);
        })
        .then(function(rows) {
            var existsInLog = _.chain(rows).pluck('upc_code').map(function(c) {
                return parseInt(c);
            }).value();

            var newCodes = _.difference(codes[0], existsInLog);
            log.info('UPC_CODE LENGTH PHANTOM INPUT: ' + newCodes.length);

            if (newCodes.length) {
                log.info('PHANTOM EXECUTE...');
                newCodes.unshift(parentUpc);
                return Phantom.execute(req, res, newCodes, codes[1], codes[2]);
            } else {
                log.warn('THE UPC CODES ALREADY PROCESSED');
                return true;
            }
        });
}

function getUPC(upc_code, count) {
    var codeRange = Math.abs(parseInt(count)) || 15,
        codes = [],
        code,
        i;

    for (i = 0; i <= codeRange; i++) {
        upc_code = zeroFill(upc_code, 12);

        if (i !== 0) {
            codes.push(processUPCCode(upc_code));
        }

        if (parseInt(count) > 0) {
            code = parseInt(upc_code);
            upc_code = (code + 1).toString();
        } else  {
            code = parseInt(upc_code);
            upc_code = (code - 1).toString();
        }
    }

    return codes;
};

function searchLogsByParentId(req, sort) {
    return db.searchLogById(req, sort);
}

function getUpcMinMax(req) {
    return Bluebird.all([
        searchLogsByParentId(req, 'asc'),
        searchLogsByParentId(req, 'desc')
    ]);
}

function generateUpcRecordsFromManual(code, count, id) {
    var codes = [parseInt(code)];

    var records = [
        [codes.concat(getUPC(getCode(code), count)), 'positive', id],
        [codes.concat(getUPC(getCode(code), -Math.abs(count))), 'negative', id]
    ];

    return records;
}

exports.generate = function(req, res, upc_code, count) {
    log.info('UPC_CODE GENERATOR: ' + upc_code);
    var codes = [parseInt(upc_code)];
    count = count || 2000;

    return database.getSeedByUpc(upc_code, req.query.product_id)
        .then(function(row) {
            if (row.length) {
                return row[0];
            } else {
                return database.insertSeedUpc(upc_code, req.query.product_id);
            }
        })
        .then(function(row) {
            var records = [];
            if (!_.isUndefined(row.id) && !_.isUndefined(row.upc_code)) {
                var maxUpc = _.get(row, 'last_max_upc_code', null);
                var maxStatus = _.get(row, 'max_completed');
                var minUpc = _.get(row, 'last_min_upc_code', null);
                var minStatus = _.get(row, 'min_completed');

                log.info('MAX UPC: ' + maxUpc);
                log.info('MIN UPC: ' + minUpc);
                log.info('MAX STATUS: ' + maxStatus);
                log.info('MIN STATUS: ' + minStatus);

                if (!minStatus || !maxStatus) {
                    if (!_.isNull(maxUpc) && !maxStatus) {
                        records.push([getUPC(getCode(maxUpc), count), 'positive', row.id]);
                    }

                    if (!_.isNull(minUpc) && !minStatus) {
                        records.push([getUPC(getCode(minUpc), -Math.abs(count)), 'negative', row.id]);
                    }

                    if (_.isNull(maxUpc) && !maxStatus) {
                        records.push([getUPC(getCode(row.upc_code), count), 'positive', row.id]);
                    }

                    if (_.isNull(minUpc) && !minStatus) {
                        records.push([getUPC(getCode(row.upc_code), -Math.abs(count)), 'negative', row.id]);
                    }

                    return records;
                } else if(minStatus && maxStatus) {
                    if (upc_code !== row.upc_code) {
                        return database.insertSeedUpc(upc_code, req.query.product_id)
                            .then(function(row) {
                                return generateUpcRecordsFromManual(upc_code, count, _.get(row, 'insertId'));
                            });
                    } else {
                        throw new Error('THIS UPC IS OLD SEED PLEASE UPDATE NEW ONE FOR PRODUCT ID: ' + req.query.product_id);
                    }
                } else {
                    console.log('ELSE PART MIN MAX');
                }
            } else {
                return generateUpcRecordsFromManual(upc_code, count, _.get(row, 'insertId'));
            }
        })
        .each(function(code) {
            log.info('CALLED EACH SERIES ' + _.get(code, '[1]', null));
            if (code.length > 0) {
                return search(req, res, code, parseInt(upc_code));
            } else {
                return true;
            }
        })
        .then(function(code) {
            return code;
        });
};
