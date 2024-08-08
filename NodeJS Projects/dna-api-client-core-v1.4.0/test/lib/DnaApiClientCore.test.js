'use strict';

var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    DnaApiClientCore = require('../../lib/DnaApiClientCore'),
    dnaApiClientCore,
    defaultSchema = 'http',
    defaultHostname = 'testapi.english.com',
    defaultPort = 123,
    defaultPathname = '/dna/v0.9',
    defaultQueryKey = 'appKey',
    defaultQueryValue = 'some_app_key',
    validConfiguration;

chai.use(sinonChai);

validConfiguration = {
    schema: defaultSchema,
    hostname: defaultHostname,
    port: defaultPort,
    pathname: defaultPathname,
    oauth: {
        clientId: '123',
        clientSecret: '123'
    },
    query: {}
};
validConfiguration.query[defaultQueryKey] = defaultQueryValue;

describe('Unit tests', function() {
    describe('DNA API client core', function() {
        it('should exist and be a function', function(done) {
            expect(DnaApiClientCore).to.be.instanceOf(Function);
            done();
        });

        it('should throw Error for invalid configuration', function(done) {
            expect(function() {
                new DnaApiClientCore({});
            }).to.throw(Error);

            done();
        });

        it('should accept restler as apiCaller', function(done) {
            expect(function() {
                new DnaApiClientCore(validConfiguration, require('restler'));
            }).not.to.throw(Error);

            done();
        });

        it('should throw if invalid apiCaller is passed', function(done) {
            expect(function() {
                new DnaApiClientCore(validConfiguration, {});
            }).to.throw(Error);

            done();
        });

        describe('method', function() {
            beforeEach(function(done) {
                dnaApiClientCore = new DnaApiClientCore(validConfiguration);
                done();
            });

            describe('getUrlConfigurationObjectForHost', function() {
                it('should exist and be a function', function(done) {
                    expect(dnaApiClientCore.getUrlConfigurationObjectForHost).to.be.instanceOf(Function);
                    done();
                });

                it('should return valid object', function(done) {
                    var expected = {
                        protocol: validConfiguration.schema,
                        hostname: validConfiguration.hostname,
                        port: validConfiguration.port
                    };

                    expect(dnaApiClientCore.getUrlConfigurationObjectForHost()).to.be.eql(expected);
                    done();
                });
            });

            describe('getHost', function() {
                it('should exist and be a function', function(done) {
                    expect(dnaApiClientCore.getHost).to.be.instanceOf(Function);
                    done();
                });

                it('should return absolute host', function(done) {
                    var expected = defaultSchema + '://' + defaultHostname + ':' + defaultPort;

                    expect(dnaApiClientCore.getHost()).to.be.eql(expected);
                    done();
                });
            });

            describe('retrieveXAuthorizationHeader', function() {
                it('should exist and be a function', function(done) {
                    expect(dnaApiClientCore.retrieveXAuthorizationHeader).to.be.instanceOf(Function);
                    done();
                });

                it('should return empty object if x-authorization header cannot be retrieved', function(done) {
                    expect(dnaApiClientCore.retrieveXAuthorizationHeader({})).to.be.eql({});
                    done();
                });

                it('should return valid header for valid request with user and access token', function(done) {
                    var token = 'this_is_token',
                        req = {user: {accessToken: token}};

                    expect(dnaApiClientCore.retrieveXAuthorizationHeader(req)).to.be.eql({'x-authorization': 'Bearer ' + token});
                    done();
                });
            });

            describe('retrieveDefaultHeadersOption', function() {
                it('should exist and be a function', function(done) {
                    expect(dnaApiClientCore.retrieveDefaultHeadersOption).to.be.instanceOf(Function);
                    done();
                });

                it('should call retrieveXAuthorizationHeader', function(done) {
                    sinon.spy(dnaApiClientCore, 'retrieveXAuthorizationHeader');
                    expect(dnaApiClientCore.retrieveXAuthorizationHeader.called).to.be.false();
                    dnaApiClientCore.retrieveDefaultHeadersOption();
                    expect(dnaApiClientCore.retrieveXAuthorizationHeader.calledOnce).to.be.true();
                    done();
                });
            });

            describe('retrieveDefaultOptions', function() {
                it('should exist and be a function', function(done) {
                    expect(dnaApiClientCore.retrieveDefaultOptions).to.be.instanceOf(Function);
                    done();
                });

                it('should call retrieveDefaultHeadersOption', function(done) {
                    sinon.spy(dnaApiClientCore, 'retrieveDefaultHeadersOption');
                    expect(dnaApiClientCore.retrieveDefaultHeadersOption.called).to.be.false();
                    dnaApiClientCore.retrieveDefaultOptions();
                    expect(dnaApiClientCore.retrieveDefaultHeadersOption.calledOnce).to.be.true();
                    done();
                });
            });

            describe('getUri', function() {
                it('should exist and be a function', function(done) {
                    expect(dnaApiClientCore.getUri).to.be.instanceOf(Function);
                    done();
                });

                it('should return valid absolute uri by default', function(done) {
                    var endpoint = 'i-am-an-endpoint',
                        expected;

                    expected = defaultSchema + '://' + defaultHostname + ':' + defaultPort + defaultPathname + '/' + endpoint + '?' + defaultQueryKey + '=' + defaultQueryValue;

                    expect(dnaApiClientCore.getUri(endpoint)).to.be.eql(expected);
                    done();
                });

                it('should return valid relative uri by is called with absolute === false', function(done) {
                    var endpoint = 'i-am-an-endpoint',
                        expected;

                    expected = defaultPathname + '/' + endpoint + '?' + defaultQueryKey + '=' + defaultQueryValue;

                    expect(dnaApiClientCore.getUri(endpoint, false)).to.be.eql(expected);
                    done();
                });

                it('should handle additional querystring params', function(done) {
                    var endpoint = 'i-am-an-endpoint',
                        expected,
                        paramKey = 'paramKey',
                        paramValue = 'paramValue',
                        params = {};

                    params[paramKey] = paramValue;

                    expected = defaultPathname + '/' + endpoint + '?' + defaultQueryKey + '=' + defaultQueryValue + '&' + paramKey + '=' + paramValue;

                    expect(dnaApiClientCore.getUri(endpoint, false, params)).to.be.eql(expected);
                    done();
                });
            });
        });

        describe('property', function() {
            describe('apiCaller', function() {
                var apiCallerMock = {
                    get: sinon.spy(),
                    post: sinon.spy(),
                    put: sinon.spy(),
                    del: sinon.spy(),
                    head: sinon.spy(),
                    patch: sinon.spy(),
                    json: sinon.spy(),
                    postJson: sinon.spy(),
                    putJson: sinon.spy()
                };

                beforeEach(function() {
                    dnaApiClientCore = new DnaApiClientCore(validConfiguration, apiCallerMock);
                });

                it('should be passed apiCaller', function(done) {
                    expect(dnaApiClientCore.apiCaller).to.be.equal(apiCallerMock);
                    done();
                });

                describe('method', function() {

                    describe('get', function() {
                        it('should be called when calling dnaApiClientCore.get', function(done) {
                            var url = 'this/is/valid/url',
                                options = {option: 'this-is-valid-option'};

                            expect(apiCallerMock.get.called).to.be.false();
                            dnaApiClientCore.get(url, options);
                            expect(apiCallerMock.get.calledOnce).to.be.true();
                            expect(apiCallerMock.get).to.have.been.calledWithExactly(url, options);
                            done();
                        });
                    });

                    describe('post', function() {
                        it('should be called when calling dnaApiClientCore.post', function(done) {
                            var url = 'this/is/valid/url',
                                options = {option: 'this-is-valid-option'};

                            expect(apiCallerMock.post.called).to.be.false();
                            dnaApiClientCore.post(url, options);
                            expect(apiCallerMock.post.calledOnce).to.be.true();
                            expect(apiCallerMock.post).to.have.been.calledWithExactly(url, options);
                            done();
                        });
                    });

                    describe('put', function() {
                        it('should be called when calling dnaApiClientCore.put', function(done) {
                            var url = 'this/is/valid/url',
                                options = {option: 'this-is-valid-option'};

                            expect(apiCallerMock.put.called).to.be.false();
                            dnaApiClientCore.put(url, options);
                            expect(apiCallerMock.put.calledOnce).to.be.true();
                            expect(apiCallerMock.put).to.have.been.calledWithExactly(url, options);
                            done();
                        });
                    });

                    describe('del', function() {
                        it('should be called when calling dnaApiClientCore.del', function(done) {
                            var url = 'this/is/valid/url',
                                options = {option: 'this-is-valid-option'};

                            expect(apiCallerMock.del.called).to.be.false();
                            dnaApiClientCore.del(url, options);
                            expect(apiCallerMock.del.calledOnce).to.be.true();
                            expect(apiCallerMock.del).to.have.been.calledWithExactly(url, options);
                            done();
                        });
                    });

                    describe('head', function() {
                        it('should be called when calling dnaApiClientCore.head', function(done) {
                            var url = 'this/is/valid/url',
                                options = {option: 'this-is-valid-option'};

                            expect(apiCallerMock.head.called).to.be.false();
                            dnaApiClientCore.head(url, options);
                            expect(apiCallerMock.head.calledOnce).to.be.true();
                            expect(apiCallerMock.head).to.have.been.calledWithExactly(url, options);
                            done();
                        });
                    });

                    describe('patch', function() {
                        it('should be called when calling dnaApiClientCore.patch', function(done) {
                            var url = 'this/is/valid/url',
                                options = {option: 'this-is-valid-option'};

                            expect(apiCallerMock.patch.called).to.be.false();
                            dnaApiClientCore.patch(url, options);
                            expect(apiCallerMock.patch.calledOnce).to.be.true();
                            expect(apiCallerMock.patch).to.have.been.calledWithExactly(url, options);
                            done();
                        });
                    });

                    describe('json', function() {
                        it('should be called when calling dnaApiClientCore.json', function(done) {
                            var url = 'this/is/valid/url',
                                data = {data: 'this-is-some-data'},
                                options = {option: 'this-is-valid-option'};

                            expect(apiCallerMock.json.called).to.be.false();
                            dnaApiClientCore.json(url, data, options);
                            expect(apiCallerMock.json.calledOnce).to.be.true();
                            expect(apiCallerMock.json).to.have.been.calledWithExactly(url, data, options);
                            done();
                        });
                    });

                    describe('postJson', function() {
                        it('should be called when calling dnaApiClientCore.postJson', function(done) {
                            var url = 'this/is/valid/url',
                                data = {data: 'this-is-some-data'},
                                options = {option: 'this-is-valid-option'};

                            expect(apiCallerMock.postJson.called).to.be.false();
                            dnaApiClientCore.postJson(url, data, options);
                            expect(apiCallerMock.postJson.calledOnce).to.be.true();
                            expect(apiCallerMock.postJson).to.have.been.calledWithExactly(url, data, options);
                            done();
                        });
                    });

                    describe('putJson', function() {
                        it('should be called when calling dnaApiClientCore.putJson', function(done) {
                            var url = 'this/is/valid/url',
                                data = {data: 'this-is-some-data'},
                                options = {option: 'this-is-valid-option'};

                            expect(apiCallerMock.putJson.called).to.be.false();
                            dnaApiClientCore.putJson(url, data, options);
                            expect(apiCallerMock.putJson.calledOnce).to.be.true();
                            expect(apiCallerMock.putJson).to.have.been.calledWithExactly(url, data, options);
                            done();
                        });
                    });
                });
            });
        });
    });
});

describe('Functional tests', function() {
    describe('DNA API client core', function() {
        describe('method', function() {
            beforeEach(function(done) {
                dnaApiClientCore = new DnaApiClientCore(validConfiguration);
                done();
            });

            describe('getHost', function() {
                it('should return absolute host', function(done) {
                    var expected = defaultSchema + '://' + defaultHostname + ':' + defaultPort;

                    expect(dnaApiClientCore.getHost()).to.be.eql(expected);
                    done();
                });
            });

            describe('getUri', function() {
                it('should return valid absolute uri by default', function(done) {
                    var endpoint = 'i-am-an-endpoint',
                        expected;

                    expected = defaultSchema + '://' + defaultHostname + ':' + defaultPort + defaultPathname + '/' + endpoint + '?' + defaultQueryKey + '=' + defaultQueryValue;

                    expect(dnaApiClientCore.getUri(endpoint)).to.be.eql(expected);
                    done();
                });

                it('should return valid relative uri by is called with absolute === false', function(done) {
                    var endpoint = 'i-am-an-endpoint',
                        expected;

                    expected = defaultPathname + '/' + endpoint + '?' + defaultQueryKey + '=' + defaultQueryValue;

                    expect(dnaApiClientCore.getUri(endpoint, false)).to.be.eql(expected);
                    done();
                });

                it('should handle additional querystring params', function(done) {
                    var endpoint = 'i-am-an-endpoint',
                        expected,
                        paramKey = 'paramKey',
                        paramValue = 'paramValue',
                        params = {};

                    params[paramKey] = paramValue;

                    expected = defaultPathname + '/' + endpoint + '?' + defaultQueryKey + '=' + defaultQueryValue + '&' + paramKey + '=' + paramValue;

                    expect(dnaApiClientCore.getUri(endpoint, false, params)).to.be.eql(expected);
                    done();
                });
            });
        });
    });
});
