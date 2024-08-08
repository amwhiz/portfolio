'use strict';

var _ = require('lodash'),
    Bluebird = require('bluebird'),
    database = require('../../../upc/database'),
    log = require('../../../upc/log');

function getMinMaxRange(value) {
    var range = {
        min: 0,
        max: 0
    };

    if (!_.isNull(value) && _.contains(value, '(')) {
        var regExp = /\(([^)]+)\)/;
        var matches = regExp.exec(value);
        var rangeText = matches[1];

        if (_.contains(rangeText, 'and')) {
            rangeText = rangeText.split(' and ').map(function(value) {
                return value.replace(/\+/g,"");
            });
        }

        if (_.contains(rangeText, 'to')) {
            rangeText = rangeText.split(' to ').map(function(value) {
                return value.replace(/\+/g,"");
            });
        }

        if (isNaN(parseFloat(rangeText[0]))) {
            range.min = 0;
        } else {
            range.min = Math.abs(parseFloat(rangeText[0]));
        }

        if (isNaN(parseFloat(rangeText[1]))) {
            range.max = 100;
        } else {
            range.max = Math.abs(parseFloat(rangeText[1]));
        }
    } else if (!_.isNull(value) && !_.contains(value, '(')) {
        if (isNaN(parseFloat(value))) {
            range.min = 0;
        } else {
            range.min = Math.abs(parseFloat(value));
        }
    }

    if (value.toLowerCase() === 'low') {
        range.min = 0;
        range.max = 1;
    } else if(value.toLowerCase() === 'medium') {
        range.min = 1.25;
        range.max = 2;
    } else if(value.toLowerCase() === 'high') {
        range.min = 2.25;
        range.max = 100;
    }

    return range;
}

function formatMinMax(ot, ot_v, ad_r) {
    // var range = {
    //     type: null,
    //     value: null
    // };

    var str = '';

    if (ad_r !== '' && !_.isNull(ad_r)) {
        var addOn = ad_r.substring(1);
        str = addOn.concat(ot_v);
    } else {
        if (ot_v === 'HI') {
            str = '("2.00", "2.25", "2.50", "3.00", "2.50/high")';
        }

        if (ot_v === 'MD') {
            str = '("1.25", "1.50", "1.75", "2.00", "1.75/mid", "2.00/mid")';
        }

        if (ot_v === 'LO') {
            str = '("0.75", "1.00", "1.25", "1.00/low", "1.25/low", "1.50/low")';
        }
    }

    // if (_.contains(ot, 'low')) {
    //     range.type = '1.00/low';
    //     range.value = '1.25';
    // }
    //
    // if (_.contains(ot, 'medium')) {
    //     range.type = '2.00/mid';
    //     range.value = '2.00';
    // }
    //
    // if (_.contains(ot, 'high')) {
    //     range.type = '2.50/high';
    //     range.value = '2.50';
    // }

    return str;
}

function getProductAttributeMapping() {
    var mapping = {
        p : 1,
        bc: 2,
        d: 3,
        c: 4,
        ax: 5,
        ot: 6
    };

    return mapping;
}

function getAttributeValues(data) {
    var values = [];
    var specification = data.specification;
    if (specification.p && !_.isNull(specification.p) && specification.p !== '') {
        values.push(['p', specification.p]);
    }

    if (specification.bc && !_.isNull(specification.bc) && specification.bc !== '') {
        values.push(['bc', specification.bc]);
    }

    if (specification.d && !_.isNull(specification.d) && specification.d !== '') {
        values.push(['d', specification.d]);
    }

    if (specification.c && !_.isNull(specification.c) && specification.c !== '') {
        values.push(['c', specification.c]);
    }

    if (specification.ax && !_.isNull(specification.ax) && specification.ax !== '') {
        values.push(['ax', specification.ax]);
    }

    if (specification.ot && !_.isNull(specification.ot) && specification.ot !== '') {
        var range = formatMinMax(specification.ot.toLowerCase(), specification.ot_v, specification.ad_r);
        values.push(['ot', range]);
    }

    return values;
}

function generateAttributeValuesQuery(data, productId) {
    var alias = ['a', 'b', 'c', 'd', 'e', 'f'];
    var sql = 'SELECT a.product_id FROM ';
    var attrValues = getAttributeValues(data);
    var attrMapping = getProductAttributeMapping();
    var condition = '';

    _.forEach(attrValues, function(v, k) {
        if (attrValues.length - 1 === k) {
            sql = sql + 'product_shippable_to_attribute_type_values AS ' + alias[k];
            if (v[0] === 'ot') {
                if (v[1].indexOf('(') > -1) {
                    condition = condition +
                        alias[k] + '.product_shippable_setup_attribute_type_id = ' +
                        attrMapping[v[0]] + ' AND (' + alias[k] + '.value_varchar IN ' + v[1] + ') AND ' +
                        alias[k] + '.product_id = ' + alias[0] + '.product_id';
                } else {
                    condition = condition +
                        alias[k] + '.product_shippable_setup_attribute_type_id = ' +
                        attrMapping[v[0]] + ' AND (' + alias[k] + '.value_varchar = "' + v[1] + '") AND ' +
                        alias[k] + '.product_id = ' + alias[0] + '.product_id';
                }
            } else {
                condition = condition +
                    alias[k] + '.product_shippable_setup_attribute_type_id = ' +
                    attrMapping[v[0]] + ' AND FORMAT(' + alias[k] + '.value_varchar, 2) = FORMAT(' + v[1] + ',2) AND ' +
                    alias[k] + '.product_id = ' + alias[0] + '.product_id';
            }
        } else {
            sql = sql + 'product_shippable_to_attribute_type_values AS ' + alias[k] + ', ';
            condition = condition +
                alias[k] + '.product_shippable_setup_attribute_type_id = ' +
                attrMapping[v[0]] + ' AND FORMAT(' + alias[k] + '.value_varchar, 2) = FORMAT(' + v[1] + ',2) AND ' +
                alias[k] + '.product_id = ' + alias[k + 1] + '.product_id AND ';
        }
    });

    var query = sql + ' WHERE ' + condition + ' AND a.product_id in(SELECT p.id FROM products p LEFT JOIN product_upc_skus pus ON p.id = pus.product_id WHERE p.grouping_product_id = "' + productId + '" AND p.is_deleted = "0" AND pus.upc_sku IS NULL)';
    console.log('=====================================================================');
    console.log(query);
    console.log('=====================================================================');
    return query;
}

function updateAbb(upc_code, child_id) {
    var sql = 'UPDATE abb_contacts SET import_child_product_id= ? WHERE upc_code= ?';
    var params = [child_id, upc_code];

    return database.queryParams(database.abbDB, sql, params);
}

function insertUpcSku(upc_code, child_id) {
    var sql = 'INSERT INTO product_upc_skus(product_id, upc_sku, created_notes, created) VALUES(?, ?, ?, NOW())';
    var params = [child_id, upc_code, 'UPC Sku from ABB Importer Script'];

    return database.queryParams(database.ezDB, sql, params);
}

function insertScriptLog(data, childProductId, parentId, seedUpc) {
    var sql = 'INSERT INTO log_abb_script_details(main_product_id, child_product_id, seed_upc, generated_upc, abb_response) VALUES(?, ?, ?, ?, ?)';
    var params = [parentId, childProductId, seedUpc, _.get(data, 'product_upc_code'), JSON.stringify(data)];

    return database.queryParams(database.abbDB, sql, params);
}

function insert(data, parentId, seedUpc) {
    var range = getMinMaxRange(data.specification.ot),
        sql = 'INSERT INTO abb_contacts(upc_code, attr_power, attr_bc, attr_diameter, attr_add, product_name, brand_name, attr_cylinder, attr_axis, attr_add_min, attr_add_max, import_main_product_id) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        params = [
            data.product_upc_code,
            data.specification.p,
            data.specification.bc,
            data.specification.d,
            data.specification.ot.toLowerCase(),
            data.product_name,
            data.brand_name,
            data.specification.c,
            data.specification.ax,
            range.min,
            range.max,
            parentId
        ];

    database.queryParams(database.abbDB, sql, params)
        .then(function(row) {
            log.info('ABB DATA HAS BEEN INSERTED: ' + _.get(data, 'product_upc_code'));
            var query = generateAttributeValuesQuery(data, parentId);
            database.query(database.ezDB, query)
                .then(function(row) {
                    var childProductId = _.get(row, '[0].product_id', null);
                    if (!_.isNull(childProductId) && childProductId !== '') {
                        return Bluebird.all([
                            insertUpcSku(_.get(data, 'product_upc_code'), childProductId),
                            updateAbb(_.get(data, 'product_upc_code'), childProductId),
                            insertScriptLog(data, childProductId, parentId, seedUpc)
                        ]).spread(function() {
                            log.info('PRODUCT ID: ' + childProductId + ' UPC CODE: ' + _.get(data, 'product_upc_code') + ' DONE');
                        }).catch(function(err) {
                            log.err(err);
                            return true;
                        });
                    } else {
                        return insertScriptLog(data, childProductId, parentId, seedUpc)
                            .then(function() {
                                return true;
                            });
                    }
                });
        })
        .catch(function(err) {
            log.err(err);
            return true;
        });
};

exports.save = function(req, res, dataCollection, codes) {
    var upcCodes = codes;
    var self = this;
    return new Bluebird(function(resolve, reject) {
            resolve(dataCollection);
        })
        .then(function(codes) {
            var collection = [];
            for (var i = 0; i < dataCollection.length; i++) {
                if(!_.isNull(dataCollection[i])) {
                    try {
                        var data = dataCollection[i];
                        data.product_id = req.query.product_id;
                        upcCodes = _.remove(upcCodes, function(upcCode) {
                            return upcCode === parseInt(data.product_upc_code);
                        });
                        collection.push(insert(data));
                        collection.push(self.log(req, data.product_upc_code, 'success'));
                    }
                    catch(e) {
                        console.log(e.message);
                        console.log(dataCollection[i]);
                    }

                }
            }

            for (var i = 0; i < upcCodes.length; i++) {
                collection.push(self.log(req, upcCodes[i], 'invalid'));
            }

            return Bluebird.all(collection);
        });
};

exports.search = function(codes) {
    var sql = 'SELECT upc_code FROM log_abb_script_upc_checks WHERE upc_code IN (' + codes + ')';
    return database.query(database.abbDB, sql);
};

exports.searchAbb = function(codes) {
    var sql = 'SELECT upc_code FROM abb_contacts WHERE upc_code IN (' + codes + ')';
    return database.query(database.abbDB, sql);
};

exports.log = function(req, code, status) {
    var sql = 'INSERT INTO upc_code_logs(codes, status, parent_id) VALUES(?,?,?)',
        params = [code, status, req.query.product_id];

    return database.queryParams(database.abbDB, sql, params)
        .then(function() {
            log.info('LOG INSERTED: ' + code);
            return true;
        })
        .catch(function(err) {
            log.err(err);
            return true;
        });
};

exports.searchLogById = function(req, sort) {
    var sql = 'SELECT codes FROM upc_code_logs WHERE parent_id = \'' + req.query.product_id + '\'' + ' ORDER BY codes ' + sort + ' LIMIT 1';
    return database.query(database.abbDB, sql);
};

var insertSuccessLog = function(data, id) {
    var sql = 'INSERT INTO log_abb_script_upc_checks(parent_id, upc_code, data_received, status) VALUES(?, ?, ?, ?)';
    var params = [
        id,
        data.product_upc_code,
        JSON.stringify(data),
        'SUCCESS'
    ];

    return database.queryParams(database.abbDB, sql, params)
        .then(function() {
            log.info('SUCCESS LOG INSERTED: ' + data.product_upc_code);
            return true;
        })
        .catch(function(err) {
            log.err(err);
            return true;
        });
};

var insertInvalidLog = function(data, id) {
    console.log(data);
    var sql = 'INSERT INTO log_abb_script_upc_checks(parent_id, upc_code, data_received, status) VALUES(?, ?, ?, ?)';
    var params = [
        id,
        data.product_upc_code,
        data.mismatch || 'The entered UPC Code was not found',
        'INVALID'
    ];

    return database.queryParams(database.abbDB, sql, params)
        .then(function() {
            log.info('INVALID LOG INSERTED: ' + data.product_upc_code);
            return true;
        })
        .catch(function(err) {
            log.err(err);
            return true;
        });
};

exports.upcLog = function(records, parentId, status, seedUpc) {
    console.log('=========== RECORDS FROM PHANTOM ==============');
    console.log(records.toString());
    console.log('===============================================');

    try {
        records = JSON.parse(records);
    } catch(e) {
        log.info('APP DB SERVICE CATCH BLOCK');
        log.err(e.toString());
        log.err(e);
    }

    if (_.isObject(records) && !_.isNull(_.get(records, 'product_upc_code', null))) {
        if (_.isUndefined(records.brand_name) &&
            _.isUndefined(records.product_name) &&
            _.isUndefined(records.specification)) {
            insertInvalidLog(records, parentId);
        } else {
            insertSuccessLog(records, parentId);
            insert(records, parentId, seedUpc);
        }
    }
};
