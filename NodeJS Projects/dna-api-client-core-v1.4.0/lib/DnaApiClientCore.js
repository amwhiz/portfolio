'use strict';

var url = require('url'),
    _ = require('lodash'),
    configValidator = require('./validation/configValidator'),
    apiCallerValidator = require('./validation/apiCallerValidator'),
    defaultConfiguration = require('./defaultConfiguration'),
    access = require('safe-access'),
    DnaApiClientCore;

/**
 * Pearson DNA API client core
 * @param configuration
 * @param  apiCaller {{
 *         get:Function,
 *         post:Function,
 *         put:Function,
 *         del:Function,
 *         head:Function,
 *         patch:Function,
 *         json:Function,
 *         postJson:Function,
 *         putJson:Function
 *     }}
 * @constructor
 */
DnaApiClientCore = function(configuration, apiCaller) {
    this.configuration = _.assign({}, defaultConfiguration, configuration);
    if (!configValidator.validate(this.configuration)) {
        throw new Error('Configuration is invalid');
    }

    this.apiCaller = apiCaller || require('restler-bluebird');
    if (!apiCallerValidator.validate(this.apiCaller)) {
        throw new Error('API caller implementation is invalid');
    }
};

DnaApiClientCore.prototype.get = function(url, options) {
    return this.apiCaller.get(url, options);
};

DnaApiClientCore.prototype.post = function(url, options) {
    return this.apiCaller.post(url, options);
};

DnaApiClientCore.prototype.put = function(url, options) {
    return this.apiCaller.put(url, options);
};

DnaApiClientCore.prototype.del = function(url, options) {
    return this.apiCaller.del(url, options);
};

DnaApiClientCore.prototype.head = function(url, options) {
    return this.apiCaller.head(url, options);
};

DnaApiClientCore.prototype.patch = function(url, options) {
    return this.apiCaller.patch(url, options);
};

DnaApiClientCore.prototype.json = function(url, data, options) {
    return this.apiCaller.json(url, data, options);
};

DnaApiClientCore.prototype.postJson = function(url, data, options) {
    return this.apiCaller.postJson(url, data, options);
};

DnaApiClientCore.prototype.putJson = function(url, data, options) {
    return this.apiCaller.putJson(url, data, options);
};

/**
 * Returns configuration object for URL node module to build absolute host address
 * @returns {{protocol: (string|schema.schema|schema|exports.schema), hostname: (*|schema.hostname|exports.errors.string.hostname|hostname|expected.hostname|internals.String.hostname), port: (null|port|schema.port|expected.port|creq.port|Function|*)}}
 */
DnaApiClientCore.prototype.getUrlConfigurationObjectForHost = function() {
    return {
        protocol: this.configuration.schema,
        hostname: this.configuration.hostname,
        port: this.configuration.port
    };
};

/**
 * Returns API HOST
 * @returns {string}
 */
DnaApiClientCore.prototype.getHost = function() {
    return url.format(this.getUrlConfigurationObjectForHost());
};

/**
 *
 * @param [req]
 * @returns {*}
 */
DnaApiClientCore.prototype.retrieveXAuthorizationHeader = function(req) {
    var accessToken = access(req, 'user.accessToken');

    return accessToken ? {'x-authorization': 'Bearer ' + accessToken} : {};
};

/**
 * Retrieves default headers from request
 * @param [req]
 * @returns {{headers: {}}}
 */
DnaApiClientCore.prototype.retrieveDefaultHeadersOption = function(req) {
    var headers = {};

    _.assign(headers, this.retrieveXAuthorizationHeader(req));
    // add new retrievers here

    return {headers: headers};
};

/**
 * Retrieves default options based on request
 * @param [req]
 * @returns {{}}
 */
DnaApiClientCore.prototype.retrieveDefaultOptions = function(req) {
    var options = {};

    _.assign(options, this.retrieveDefaultHeadersOption(req));
    // add new retrievers here

    return options;
};

/**
 * Returns URI for API CALL
 * @param endpointName api call prototype
 * @param [absolute=true] If true - returns absolute URI. False - returns relative URI.
 * @param [params={}]
 * @returns {string}
 */
DnaApiClientCore.prototype.getUri = function(endpointName, absolute, params) {
    var urlObj;

    absolute = absolute !== false;
    params = params || {};

    urlObj = {
        query: _.assign({}, this.configuration.query, params),
        pathname: this.configuration.pathname + '/' + endpointName
    };

    if (absolute) {
        _.assign(urlObj, this.getUrlConfigurationObjectForHost());
    }

    return url.format(urlObj);
};

module.exports = DnaApiClientCore;
