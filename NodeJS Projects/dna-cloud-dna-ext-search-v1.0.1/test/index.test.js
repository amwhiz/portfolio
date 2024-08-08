'use strict';

var rewire = require('rewire'),
    expect = require('chai').expect,
    sinon = require('sinon'),
    mocksProto = require('dna-cloud-dna-ext-mocks'),
    _cloneDeep = require('lodash.clonedeep'),
    dnaCloudDnaExtSearch = require('./../index'),
    sharedBehaviours = require('./sharedBehaviours');

describe('DNA CloudDNA search extension', function() {
    var mocks;

    beforeEach(function() {
        mocks = _cloneDeep(mocksProto);
    });

    sharedBehaviours.nock();
    sharedBehaviours.sinonChai();

    describe('method', function() {
        describe('load', function() {
            it('should be a function', function() {
                expect(dnaCloudDnaExtSearch.load).to.be.instanceOf(Function);
            });

            it('should call plugRoutingIn', function() {
                var plugRoutingInSpy = sinon.spy(),
                    dnaCloudDnaExtSearch;

                dnaCloudDnaExtSearch = rewire('../index');
                dnaCloudDnaExtSearch.__set__('plugRoutingIn', plugRoutingInSpy);

                dnaCloudDnaExtSearch.load(mocks);
                expect(plugRoutingInSpy).to.have.been.calledWithExactly(
                    mocks.cloudDnaExpress.router,
                    mocks.middlewares,
                    mocks.cloudDnaExpressDnaElasticsearch
                );
            });
        });
    });
});
