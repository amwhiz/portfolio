'use strict';

var expect = require('chai').expect,
    statementSanitizer = require('../../lib/statement-sanitizer/statement.sanitizer'),
    _ = require('lodash');

describe('Unit tests', function() {
    describe('Statement Sanitizer', function() {
        it('should exist', function() {
            expect(statementSanitizer).to.exist();
        });

        it('should be a function', function() {
            expect(statementSanitizer).to.be.a('function');
        });

        it('should set default id if it is not provided', function() {
            var statement = {};

            statementSanitizer(statement);
            expect(statement).to.have.property('id');
        });

        it('should not change id when is provided', function() {
            var id = 'asd',
                statement = {id: id};

            statementSanitizer(statement);
            expect(statement.id).to.equal(id);
        });

        it('should set default version if not set', function() {
            var statement = {};

            statementSanitizer(statement);
            expect(statement).to.have.property('version');
        });

        it('should not change version if is set', function() {
            var version = '1.0.0',
                statement = {version: version};

            statementSanitizer(statement);
            expect(statement.version).to.equal(version);
        });

        it('should set default stored if is set', function() {
            var statement = {};
            statementSanitizer(statement);
            expect(statement).to.have.property('stored');
        });

        it('should set default stored if is not set', function() {
            var stored = 'dsa',
                statement = {stored: stored};

            statementSanitizer(statement);
            expect(statement.stored).to.not.equal(stored);
        });

        it('should set default timestamp if not set', function() {
            var statement = {};

            statementSanitizer(statement);
            expect(statement).to.have.property('timestamp');
        });

        it('should not change timestamp if is set', function() {
            var timestamp = '1.0.0',
                statement = {version: timestamp};

            statementSanitizer(statement);
            expect(statement.stored).to.not.equal(timestamp);
        });

        it('should not set default objectType if object is not set', function() {
            var statement = {};

            statementSanitizer(statement);
            expect(statement).to.not.have.property('object');
        });

        it('should set default objectType if object is set and not empty', function() {
            var statement = {object: {1: 1}};

            statementSanitizer(statement);
            expect(statement.object).to.have.property('objectType');
        });

        it('should convert contextActivities to array for existing keys', function() {
            var statement = {
                context: {
                    contextActivities: {
                        parent: {1: 1},
                        category: {1: 1}
                    }
                }
            };

            statementSanitizer(statement);
            expect(statement.context.contextActivities).to.not.have.property('other');
            expect(statement.context.contextActivities).to.not.have.property('grouping');
            expect(statement.context.contextActivities.parent).to.be.an('array');
            expect(statement.context.contextActivities.category).to.be.an('array');
        });
    });
});
