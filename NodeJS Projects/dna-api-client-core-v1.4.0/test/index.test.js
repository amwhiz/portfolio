'use strict';

var expect = require('chai').expect,
    DnaApiClientCore = require('../lib/DnaApiClientCore');

describe('Unit tests', function() {
    describe('Module root', function() {
        it('should export DnaApiClientCore', function(done) {
            expect(require('../index')).to.be.equal(DnaApiClientCore);
            done();
        });
    });
});
