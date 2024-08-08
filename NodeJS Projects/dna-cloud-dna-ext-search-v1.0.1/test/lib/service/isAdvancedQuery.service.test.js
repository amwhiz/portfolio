'use strict';

var expect = require('chai').expect,
    isAdvancedQuery = require('../../../lib/service/isAdvancedQuery.service');

describe('isAdvancedQuery', function() {
    it('should be a function', function() {
        expect(isAdvancedQuery).to.be.a('function');
    });

    describe('for query containing one of: AND, OR, THEN, *, (, )', function() {
        var qs = [];

        qs.push('this AND that');
        qs.push('this OR that');
        qs.push('this NOT that');
        qs.push('th*');
        qs.push('this (that)');
        qs.push('((this AND that) OR these AND NOT those)');

        qs.forEach(function(q) {
            it('should return true for phrase: "' + q + '"', function() {
                expect(isAdvancedQuery(q)).to.equal(true);
            });
        });
    });

    describe('for query non-containing one of: AND, OR, THEN, *, (, )', function() {
        var qs = [];

        qs.push('simple query');
        qs.push('');

        qs.forEach(function(q) {
            it('should return false for phrase: "' + q + '"', function() {
                expect(isAdvancedQuery(q)).to.equal(false);
            });
        });
    });
});
