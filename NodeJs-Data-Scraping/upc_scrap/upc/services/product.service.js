'use strict';

var _  = require('lodash'),
    Bluebird = require('bluebird'),
    ABB = require('./abb.service'),
    database = require('../database'),
    log = require('../log'),
    productType,
    Product;

// Types Mapping
productType = {
    BC: 'attr_bc',
    Power: 'attr_power',
    Diameter: 'attr_diameter',
    Cylinder: 'attr_cylinder',
    Axis: 'attr_axis',
    ADD: 'attr_add',
    Style: '',
    Color: 'attr_color',
    Size: '',
    Sphere: ''
};

// module begins
Product = function() {
    // constructor code here
};

// Product Info
Product.info = function(productId) {
    var query = 'SELECT id, grouping_product_id, product_classification_id, product_name, manufacturer_id, is_deleted FROM products WHERE is_deleted=\'0\' AND product_classification_id=\'2\'';
    if (productId) {
        query += ' AND id=\'' + productId + '\'';
    }
    return database.query(database.ezDB, query);
};

// Child Process
Product.child = function(productId) {
    var query = 'SELECT p.id, p.grouping_product_id, p.product_classification_id, p.product_name, p.manufacturer_id, p.is_deleted FROM products p LEFT JOIN product_upc_skus pus ON p.id = pus.product_id WHERE p.grouping_product_id = \'' +  productId +'\' AND p.is_deleted=\'' + 0 +'\' AND pus.upc_sku IS NULL';

    return database.query(database.ezDB, query);
};

// Child UPC
Product.upc = function(productId) {
    var query = 'SELECT upc_sku FROM product_upc_skus WHERE product_id IN (SELECT id FROM products WHERE grouping_product_id = ?) AND created_notes IS NULL ORDER BY created DESC';
    var params = [productId];
    return database.queryParams(database.ezDB, query, params);
};

// Get Product Id for Product Array
Product.getId = function(product) {
    return new Bluebird(function(resolve, reject) {
        return resolve(product.id);
    });
};

// Get UPC Row for Product Id
Product.getUPC = function(productId) {
    var query = 'SELECT * FROM product_upc_skus WHERE product_id = \'' + productId + '\'';
    return database.query(database.ezDB, query);
};

// Get the Product Values
Product.getProductValues = function(productId) {
    var query = 'SELECT product_shippable_setup_attribute_type_id as id, value_varchar FROM product_shippable_to_attribute_type_values WHERE product_id = \'' + productId + '\'';
    return database.query(database.ezDB, query);
};

// Get the Product Type Attribute
Product.getProductType = function(productId) {
    var query = 'SELECT id, name FROM product_shippable_setup_attribute_types WHERE id IN (SELECT product_shippable_setup_attribute_type_id FROM product_shippable_to_attribute_type_values WHERE product_id=\'' + productId + '\')';
    return database.query(database.ezDB, query);
};

// Get Product Manufacturer
Product.getMenufacturer = function(id) {
    var query = 'SELECT name FROM manufacturers WHERE id=' + id;
    return database.query(database.ezDB, query);
};

// Formation of Product Object
Product.format = function(product) {
    var result = {
        product_name: product.parent.product_name,
        brand_name: product.manufacturer.name,
        attributes: []
    };
    var properties = {};

    _.forEach(product.values, function(value, key) {
        _.forEach(product.types, function(types, key) {
            if (value.id === types.id) {
                properties[productType[types.name]] = value.value_varchar;
                result.attributes.push(productType[types.name]);
            }
        });
    });

    return _.merge({}, result, properties);
};

// Processing Each Child
Product.processChild = function(child, parent) {
    var self = this;
    var product = {
        info: child,
        parent: parent
    };

    return this.getId(child)
            .then(function(productId) {
                product.id = productId;
                return self.getUPC(productId);
            })
            .delay(100)
            .then(function(row) {
                if (row.length) {
                    throw new Error('THIS PRODUCT ' + product.id + ' ALREADY HAVE UPC CODE');
                } else {
                    return Bluebird.all([
                            self.getProductValues(product.id),
                            self.getProductType(product.id),
                            self.getMenufacturer(parent.manufacturer_id)
                        ]);
                }
            })
            .spread(function(productValues, productTypes, productManufacturer) {
                product.values = productValues;
                product.types = productTypes;
                product.manufacturer = productManufacturer[0];
                return self.format(product);
            })
            .delay(100)
            .then(function(productInfo) {
                return ABB.search(productInfo, product);
            })
            .delay(100)
            .then(function(upcCodes) {
                if (upcCodes.length && upcCodes.length === 1) {
                    var query = 'INSERT INTO product_upc_skus(product_id, upc_sku, created_notes, created) VALUES(\'' + product.id + '\', \'' + upcCodes[0].upc_code + '\',\'' + "UPC Sku from ABB Importer Script" + '\' ,\'' + NOW() + '\')';
                    var query2 = 'UPDATE abb_contacts SET import_child_product_id=\'' + product.id + '\'' + ' WHERE upc_code=\'' + upcCodes[0].upc_code + '\'';
                    return Bluebird.all([
                        database.query(database.ezDB, query),
                        database.query(database.abbDB, query2),
                        upcCodes
                    ]);
                } else {
                    throw new Error('UPC CODE NOT FOUND THIS PRODUCT:' + product.id);
                }
            })
            .spread(function(data, data2, upcCodes) {
                if (upcCodes.length && upcCodes.length === 1) {
                    return upcCodes;
                } else {
                    throw new Error('UPC CODE NOT FOUND THIS PRODUCT:' + product.id);
                }
            })
            .then(function(data) {
                log.info('UPC CODE HAS BEEN UPDATE FOR PRODUCT: ' + product.id);
                return data;
            })
            .catch(function(error) {
                log.err(error);
            });
};

Product.getUPCCount = function(productId) {
    var sql = 'SELECT COUNT(p.id) AS total FROM products p LEFT JOIN product_upc_skus pu ON p.id = pu.product_id WHERE p.grouping_product_id = ' + productId + ' AND pu.upc_sku IS NULL';
    return database.query(database.ezDB, sql);
};

// exporting module
module.exports = Product;
