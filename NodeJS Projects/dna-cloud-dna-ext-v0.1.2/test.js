'use strict';

var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    dnaCloudDnaExt = require('./index');

chai.use(require('sinon-chai'));

describe('DNA CloudDNA extensions pack', function() {
    describe('method', function() {
        describe('load', function() {
            it('should be a function', function() {
                expect(dnaCloudDnaExt.load).to.be.instanceOf(Function);
            });

            it('should call load with app passed arguments from all modules', function() {
                function createModuleMock() {
                    return {load: sinon.spy()};
                }

                var modulesBak = dnaCloudDnaExt.modules,
                    argument1 = 'argument 1',
                    argument2 = 'argument 2',
                    argument3 = 'argument 3',
                    argument4 = 'argument 4';

                dnaCloudDnaExt.modules = [
                    createModuleMock(),
                    createModuleMock(),
                    createModuleMock(),
                    createModuleMock()
                ];

                dnaCloudDnaExt.load(argument1, argument2, argument3, argument4);

                dnaCloudDnaExt.modules.forEach(function(module) {
                    expect(module.load).to.have.been.calledWithExactly(argument1, argument2, argument3, argument4);
                });

                dnaCloudDnaExt.modules = modulesBak;
            });
        });
    });
});
