'use strict';

var dbStorage = require('../../lib/dbStorage'),
    chai = require('chai'),
    expect = chai.expect;

describe('Database storage', function() {
    it('should be defined object', function(done) {
        expect(dbStorage).to.be.a('object');
        done();
    });

    describe('method getDb', function() {
        it('should exist', function() {
            expect(dbStorage.getDb).to.be.a('function');
        });

        it('should return null if not database is not set', function() {
            expect(dbStorage.getDb()).to.be.undefined;
        });
    });

    describe('method setDb', function() {
        it('should exist', function() {
            expect(dbStorage.setDb).to.be.a('function');
        });

        it('should return object which is set', function() {
            var obj = {};

            dbStorage.setDb(obj);
            expect(dbStorage.getDb()).to.deep.equal(obj);
        });
    });
});