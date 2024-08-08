'use strict';

var mongoose = require('mongoose'),
    LrsUtils,
    LrsModel = mongoose.model('Lrs');

LrsUtils = function() {

    var lrsCache = {},
        apiInfoCache = {},
        hashLrs,
        hashApi,
        parseAuthHeader,
        headerToApiInfo,
        checkForAuth,
        retriveApiInfoFromReq,
        buildWhereClauseFromReq,
        assignLrsToRequest,
        functions;

    hashLrs = function(lrs) {
        return lrs ? hashApi(lrs.api) : undefined;
    };

    hashApi = function(lrsApi) {
        return [lrsApi.basicKey, lrsApi.basicSecret].join(':');
    };

    parseAuthHeader = function(authHeader) {
        authHeader = authHeader || '';
        var ret = authHeader.split(/\s+/).pop() || '';
        ret = new Buffer(ret, 'base64').toString();
        ret = ret.split(/:/);
        return ret;
    };

    headerToApiInfo = function(authHeader) {
        /* save CPU some base64 decoding */
        if (apiInfoCache[authHeader] !== undefined) {
            return apiInfoCache[authHeader];
        }

        var ret = parseAuthHeader(authHeader);
        ret = {basicKey: ret[0], basicSecret: ret[1]};

        return apiInfoCache[authHeader] = ret;
    };

    checkForAuth = function(req) {
        return typeof req.headers.authorization === 'undefined';
    };

    retriveApiInfoFromReq = function(req) {
        return headerToApiInfo(req.headers.authorization);
    };

    buildWhereClauseFromReq = function(req) {
        var api = retriveApiInfoFromReq(req);
        return {'api.basicKey': api.basicKey, 'api.basicSecret': api.basicSecret};
    };

    assignLrsToRequest = function(req, res, next) {

        //check if there is any auth
        if (checkForAuth(req)) {
            req.lrs = undefined;
            next();
        } else {

            var hash = hashApi(retriveApiInfoFromReq(req));

            /* prevent unnecesary db call */
            if (lrsCache[hash] !== undefined) {
                req.lrs = lrsCache[hash];
                next();
                return;
            }

            LrsModel.where(buildWhereClauseFromReq(req)).findOne(function(err, lrs) {
                lrsCache[hashLrs(lrs)] = lrs;
                req.lrs = lrs;
                next();
            });
        }

    };

    functions = {
        assignLrsToRequest: assignLrsToRequest
    };

    return functions;
};

module.exports = new LrsUtils();
