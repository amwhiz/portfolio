'use strict';

var nock = require('nock');

module.exports = function() {
    before(function() {
        nock.disableNetConnect();
    });
    after(function() {
        nock.cleanAll();
        nock.enableNetConnect(/.*/);
    });
};
