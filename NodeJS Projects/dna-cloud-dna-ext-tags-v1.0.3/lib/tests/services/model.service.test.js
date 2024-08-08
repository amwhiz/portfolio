'use strict';

var modelService = require('../../services/model.service'),
    chai = require('chai'),
    sinon = require('sinon'),
    expect = chai.expect;

chai.use(require('sinon-chai'));

describe('Model service', function() {
    it('should be defined object', function() {
        expect(modelService).to.be.a('object');
    });

    describe('checkForDuplicate method', function() {
        it('should exist', function() {
            expect(modelService.checkForDuplicate).to.be.a('function');
        });

        it('should call Model count', function(done) {
            var Model,
                Error,
                fieldName = 'tagId',
                data,
                cb;

            Model = {
                count: function() {
                    done();
                }
            };

            data = {
                tagId: 'SKL0001'
            };

            Error = function() {
            };

            cb = function() {
            };

            modelService.checkForDuplicate(Model, Error, fieldName, data, cb);
        });

        describe('count callback', function() {
            var countCallback,
                Model,
                ErrorConstructor,
                fieldName = 'tagId',
                data,
                cbSpy;

            beforeEach(function() {
                Model = null;
                ErrorConstructor = null;
                data = null;
                cbSpy = null;

                Model = {
                    count: function(query, callback) {
                        countCallback = callback;
                    }
                };

                data = {
                    tagId: 'SKL0001'
                };

                ErrorConstructor = sinon.spy();

                cbSpy = sinon.spy();

                modelService.checkForDuplicate(Model, ErrorConstructor, fieldName, data, cbSpy);
            });

            it('should exist', function() {
                expect(countCallback).to.be.a('function');
            });

            it('should call callback', function() {
                countCallback();
                expect(cbSpy).to.have.been.calledWith();
            });

            it('should call callback with error when err is specified', function() {
                var err = new Error();

                countCallback(err);
                expect(cbSpy).to.have.been.calledWith(err);
            });

            it('should call callback with error when count is bigger then one', function() {
                countCallback(null, 2);
                expect(ErrorConstructor).to.have.been.callCount(1);
            });
        });
    });
});
