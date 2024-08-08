'use strict';

var _ = require('lodash'),
    Bluebird = require('bluebird'),
    Product = require('./services/product.service'),
    productController = require('../app/module/app.controller'),
    upcLogs = require('./services/upclogs.service'),
    log = require('./log');

function existsUPCCode(upcCode) {
    return upcLogs.searcUPCCode(upcCode)
        .spread(function(abb, upcLog) {
            var upcCodeAbb = _.get(abb, '[0].total'),
                upcCodeLog = _.get(upcLog, '[0].total');

            return upcCodeAbb && upcCodeLog;
        });
}

function calculateUPCTraverseCount(productId) {
    return Product.getUPCCount(productId)
        .then(function(data) {
            var total,
                count;

            total = _.get(data, '[0].total');

            if (total === 0) {
                throw new Error('ALL PRODUCTS COMPLETED FOR THIS PRODUCT ID: ' + productId);
            }

            return 2000;
        });
}

function buildQueryParams(params, product) {
    return {
        query: {
            upc_code: params.upcCode,
            count: params.upcCount,
            product_id: product.id
        }
    };
}

module.exports.handle = function(product, commandArgs) {
    var data = {};

    return Product.child(_.get(product, 'id'))
        .then(function(childProducts) {
            if (childProducts.length) {
                data.childProducts = childProducts;
                log.info('CHILD PRODUCTS COUNT: ' + childProducts.length);
                return Product.upc(_.get(product, 'id'))
                    .then(function(data) {
                        return data;
                    });
            } else {
                throw new Error('NO CHILD PRODUCTS FOR PRODUCT ID: ' + _.get(product, 'id', null));
            }
        })
        .then(function(data) {
            if (data.length) {
                return data;
            } else {
                throw new Error('NO UPC SEED FOUND');
            }
        })
        .each(function(childSeedUpcManual) {
            return Bluebird.all([
                calculateUPCTraverseCount(product.id),
                childSeedUpcManual.upc_sku
            ])
            .spread(function(upcCount, upcCode) {
                log.info('UPC CODE NEED TO PORCESS: ' + upcCode);
                log.info('UPC TRAVERSE COUNT: ' + upcCount);

                return {
                    upcCode: upcCode,
                    upcCount: upcCount
                };
            })
            .then(function(upcDetail) {
                return buildQueryParams(upcDetail, product);
            })
            .then(function(query) {
                log.info(query);
                return productController.search(query, {});
            });
        })
        .delay(10000)
        .then(function() {
            log.info('ITERATION COMPLETED FOR PRODUCT ID: ' + _.get(product, 'id'));
            return true;
        })
        .error(function(err) {
            log.err(err);
        })
        .catch(function(err) {
            log.err(err);
        });
};
