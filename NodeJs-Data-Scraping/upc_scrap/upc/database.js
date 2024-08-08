'use strict';

var mysql = require('mysql'),
    Bluebird = require('bluebird'),
    config = require('./config').db;

function getPool(params) {
    return mysql.createPool({
        host: params.host,
        user: params.user,
        password: params.password,
        database: params.database,
        connectionLimit: 10,
        supportBigNumbers: true
    });
}

function query(pool, sql) {
    return new Bluebird(function(resolve, reject) {
        pool.getConnection(function(err, conn) {
            if (err) {
                reject(err);
            } else {
                conn.query(sql, function(err, rows) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });

                conn.release();
            }
        })
    });
}

function queryParams(pool, sql, params) {
    return new Bluebird(function(resolve, reject) {
        pool.getConnection(function(err, conn) {
            if (err) {
                reject(err);
            } else {
                conn.query(sql, params, function(err, rows) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });

                conn.release();
            }
        })
    });
}

module.exports = {
    ezDB: getPool(config.core),
    abbDB: getPool(config.abb),
    query: query,
    queryParams: queryParams
};
