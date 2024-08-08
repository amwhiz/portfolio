'use strict';

var _ = require('lodash'),
    cluster = require('cluster'),
    Bluebird = require('bluebird'),
    productId = process.argv[2] || null,
    upcCount = process.argv[3] || 5000,
    upcFromArg = process.argv[5] || null,
    traverse = process.argv[4] || null,
    products = require('./products'),
    Product = require('./services/product.service'),
    logService = require('./services/upclogs.service'),
    log = require('./log'),
    getProducts,
    processProduct,
    commandArgs;

console.log('------------ EZCONTACTS -------------');
console.log('PRODUCT ID: ' + productId);
console.log('UPC COUNT: ' + upcCount);
console.log('UPC CODE: ' + upcFromArg);
console.log('TRAVERSE: ' + traverse);
console.log('-------------------------------------');

commandArgs = {
    productId: productId,
    upcCount: upcCount,
    upcFromArg: upcFromArg,
    traverse: traverse
};

getProducts = function() {
    log.info('=== GET PRODUCTS ===');
    return Product.info(productId);
};

function startEZJob() {
    logService.scriptStartLog()
        .then(function() {
            return getProducts();
        })
        .each(function(product) {
            log.info('ITERATION STARTED PRODUCT ID: ' + product.id);
            return logService.productLog(product.id)
                .then(function() {
                    return products.handle(product, commandArgs);
                });
        })
        .then(function() {
            log.info('EZ JOB PROCESS DONE');
            cluster.worker.process.kill(cluster.worker.process.pid);
        })
        .error(function(error) {
            console.log('#errorBlock');
            console.log(error);
        })
        .catch(function(error) {
            console.log('#catchBlock');
            console.log(error);
        });
}

if (cluster.isMaster) {
    setTimeout(function() {
        cluster.fork();
    }, 3000);

    cluster.on('exit', function(worker, code, signal) {
        log.warn('WORKER ' + worker.process.pid + ' DIED');
        if (!_.isNull(productId)) {
            process.kill(process.pid, 'SIGTERM');
        }
    });
} else {
    startEZJob();
}
