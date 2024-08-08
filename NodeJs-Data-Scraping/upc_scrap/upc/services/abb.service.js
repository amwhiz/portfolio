'use strict';

var _ = require('lodash'),
    Bluebird = require('bluebird'),
    database = require('../database');

function getMinMaxRange(value) {
    var range = {
        min: 0,
        ot: null
    };

    if (!_.isNull(value) && _.contains(value, '/')) {
        var rangeText = value.split('/');

        if (isNaN(parseFloat(rangeText[0]))) {
            range.min = 0;
        } else {
            range.min = Math.abs(parseFloat(rangeText[0]));
        }
        
        range.ot = rangeText[1].toLowerCase() || null;
    } else if (!_.isNull(value) && !_.contains(value, '/')) {
        if (isNaN(parseFloat(value))) {
            range.min = 0;
            range.ot = value;
        } else {
            range.min = Math.abs(parseFloat(value));
        }
    }

    return range;
}

function buildQuery(params, product) {
    var query = "SELECT upc_code, attr_add FROM abb_contacts WHERE FORMAT(attr_power, 2) = FORMAT('" + params.attr_power + "', 2) AND FORMAT(attr_bc, 2) = FORMAT(SUBSTRING_INDEX('" + params.attr_bc + "', '/', 1), 2) AND FORMAT(attr_diameter, 2) =FORMAT('" + params.attr_diameter + "', 2)";
    if(params.attributes.indexOf('attr_cylinder') > -1) {
        query += " AND FORMAT(attr_cylinder, 2) = FORMAT(" + params.attr_cylinder + ", 2)";
    }

    if(params.attributes.indexOf('attr_axis') > -1) {
        query += " AND FORMAT(attr_axis, 2) = FORMAT(" + params.attr_axis + ", 2)";
    }

    if(params.attributes.indexOf('attr_add') > -1) {
        var range = getMinMaxRange(params.attr_add);
        var min = 0;
        var max = 0;

        if (params.attr_add === '2.50/high') {
            min = 2.50;
            max = 100;
        }

        if (params.attr_add === '1.00/low') {
            min = 0;
            max = 1.00;
        }

        if (params.attr_add === '2.00/mid') {
            min = 1.25;
            max = 2.00;
        }

        if (min || max) {
            query += " AND FORMAT(attr_add_min, 2) <= FORMAT(" + min + ", 2)";
            query += " AND FORMAT(attr_add_max, 2) >= FORMAT(" + max + ", 2)";
        } else if(_.isNull(_.trim(params.attr_add))) {
            query += " AND attr_add = ''";
        } else if (range.ot) {
            query += " AND attr_add LIKE '%" + range.ot + "%'";
        } else if (isNaN(parseFloat(params.attr_add))) {
            query += " AND attr_add LIKE '%" + params.attr_add + "%'";
        } else if (!isNaN(parseFloat(params.attr_add))) {
            query += " AND FORMAT(attr_add_min, 2) <= FORMAT(" + params.attr_add + ", 2)";
            query += " AND FORMAT(attr_add_max, 2) >= FORMAT(" + params.attr_add + ", 2)";
        }
    }

    if(params.attributes.indexOf('attr_color') > -1) {
        query += ' AND attr_color=\'' + params.attr_color + '\'';
    }

    query += " AND import_main_product_id = " + _.get(product, 'parent.id', null);

    return query;
};

exports.search = function(params, product) {
    var sql = buildQuery(params, product);

    return database.query(database.abbDB, sql);
};
