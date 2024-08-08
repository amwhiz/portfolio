'use strict';

var expect = require('chai').expect,
    defaultConfiguration = require('../../lib/defaultConfiguration');

describe('Unit tests', function() {
    describe('DNA API client configuration defaults', function() {
        it('should be object of particular structure', function(done) {
            expect(defaultConfiguration).to.be.eql({
                schema: 'http',
                port: null,
                query: {}
            });
            done();
        });
    });
});
