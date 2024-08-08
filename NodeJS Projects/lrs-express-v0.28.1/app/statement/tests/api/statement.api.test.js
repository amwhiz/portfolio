'use strict';

var should = require('should'),
    request = require('supertest'),
    mongoose = require('mongoose'),
    config = require('../../../../config/config'),
    StatementModel = mongoose.model('Statement'),
    VerbModel = mongoose.model('Verb'),
    ObjectModel = mongoose.model('Object'),
    ActorModel = mongoose.model('Actor'),
    LrsModel = mongoose.model('Lrs'),
    uuid = require('node-uuid'),
    statementMock,
    voidingStatementMock;

statementMock = {
    id: uuid.v4(),
    verb: {
        id: 'http://adlnet.gov/expapi/verbs/created',
        display: {
            'en-US': 'created'
        }
    },
    object: {
        id: 'http://example.adlnet.gov/xapi/example/activity',
        type: 'custom'
    },
    actor: {
        objectType: 'Agent',
        account: {
            homePage: 'http://my.english.com',
            name: 'pearson userid'
        }
    },
    authority: {
        objectType: 'Agent',
        account: {
            homePage: 'http://my.english.com',
            name: 'pearson userid'
        }
    }
};

voidingStatementMock = {
    id: uuid.v4(),
    verb: {
        id: 'http://adlnet.gov/expapi/verbs/voided',
        display: {
            'en-US': 'voided'
        }
    },
    object: {
        id: 'http://example.adlnet.gov/xapi/example/activity',
        objectType: 'StatementRef'
    },
    actor: {
        objectType: 'Agent',
        account: {
            homePage: 'http://my.english.com',
            name: 'pearson userid'
        }
    }
};

describe('Functional tests', function() {
    describe('Statement endpoint', function() {
        var url = 'http://localhost' + ':' + config.port + config.apiPrefix,
            path = '/statements',
            id,
            apiKey,
            lrs;

        before(function(done) {
            StatementModel.remove({}, function() {
                lrs = new LrsModel();
                lrs.title = 'test lrs';
                lrs.save(function() {
                    apiKey = new Buffer([lrs.api.basicKey, lrs.api.basicSecret].join(':')).toString('base64');
                    done();
                });
            });

        });

        after(function(done) {
            LrsModel.remove(function() {
                StatementModel.remove(done);
            });
        });

        describe('API test', function() {
            describe('HTTP GET', function() {
                it('should return 401 if no atuh', function(done) {
                    request(url)
                        .get(path)
                        .send()
                        .end(function(err, res) {
                            if (err) {
                                throw err;
                            }
                            res.statusCode.should.equal(401);
                            done();
                        });
                });

                it('should start with empty collection', function(done) {
                    request(url)
                        .get(path)
                        .set('Authorization', 'Basic ' + apiKey)
                        .send()
                        .end(function(err, res) {
                            if (err) {
                                throw err;
                            }
                            res.statusCode.should.equal(200);
                            done();
                        });
                });

                it('should return 404', function(done) {
                    var id = 1;

                    request(url)
                        .get(path + '/' + id)
                        .set('Authorization', 'Basic ' + apiKey)
                        .send()
                        .end(function(err, res) {
                            if (err) {
                                throw err;
                            }
                            res.statusCode.should.equal(404);
                            done();
                        });
                });

                it('should return one entity when i create one', function(done) {
                    // creating document
                    var instanceFake = new StatementModel({
                        name: 'collection',
                        lrs: {
                            _id: lrs._id,
                            name: 'Fake lrs'
                        },
                        statement: {
                            id: uuid.v4(),
                            verb: new VerbModel({
                                id: 'http://adlnet.gov/expapi/verbs/created',
                                display: {
                                    'en-US': 'created'
                                }
                            }),
                            object: new ObjectModel({
                                id: 'http://example.adlnet.gov/xapi/example/activity'
                            }),
                            actor: new ActorModel({
                                account: {
                                    homePage: 'http://my.english.com',
                                    name: 'pearson userid'
                                }
                            }),
                            authority: new ActorModel({
                                account: {
                                    homePage: 'http://my.english.com',
                                    name: 'pearson userid'
                                }
                            })
                        }
                    });

                    instanceFake.save(function(err, data) {
                        request(url)
                            .get(path)
                            .set('Authorization', 'Basic ' + apiKey)
                            .send()
                            .end(function(err, res) {
                                if (err) {
                                    throw err;
                                }
                                id = data.statement.id;
                                res.statusCode.should.equal(200);
                                res.body.length.should.equal(1);
                                done();
                            });
                    });
                });

                it('should return one entity', function(done) {
                    request(url)
                        .get(path + '?statementId=' + id)
                        .set('Authorization', 'Basic ' + apiKey)
                        .send()
                        .end(function(err, res) {
                            if (err) {
                                throw err;
                            }
                            res.statusCode.should.equal(200);
                            res.body.should.have.property('id');
                            res.body.should.have.property('verb');
                            res.body.should.have.property('actor');
                            res.body.should.have.property('object');
                            res.body.should.have.property('authority');
                            done();
                        });
                });
            });

            describe('HTTP POST', function() {
                it('should create entity', function(done) {
                    request(url)
                        .post(path)
                        .set('Authorization', 'Basic ' + apiKey)
                        .send(statementMock)
                        .end(function(err, res) {
                            if (err) {
                                throw err;
                            }
                            res.statusCode.should.equal(200);
                            request(url)
                                .get(path)
                                .set('Authorization', 'Basic ' + apiKey)
                                .send()
                                .end(function(err, res) {
                                    id = res.body[0].id;
                                    if (err) {
                                        throw err;
                                    }
                                    res.statusCode.should.equal(200);
                                    res.body.length.should.equal(2);
                                    done();
                                });
                        });
                });

                it('should void entity when i send voiding statement', function(done) {
                    voidingStatementMock.object.id = id;

                    request(url)
                        .post(path)
                        .set('Authorization', 'Basic ' + apiKey)
                        .send(voidingStatementMock)
                        .end(function(err, res) {
                            if (err) {
                                throw err;
                            }
                            res.statusCode.should.equal(200);
                            request(url)
                                .get(path)
                                .set('Authorization', 'Basic ' + apiKey)
                                .send()
                                .end(function(err, res) {
                                    if (err) {
                                        throw err;
                                    }
                                    res.statusCode.should.equal(200);
                                    res.body.length.should.equal(2);
                                    done();
                                });
                        });
                });

                it('should send 409 conflict for existing entity', function(done) {
                    voidingStatementMock.object.id = id;

                    request(url)
                        .post(path)
                        .set('Authorization', 'Basic ' + apiKey)
                        .send(voidingStatementMock)
                        .end(function(err, res) {
                            if (err) {
                                throw err;
                            }
                            res.statusCode.should.equal(409);
                            done();
                        });
                });

                it('should send 409 conflict for existing entity', function(done) {
                    voidingStatementMock.object.id = id;

                    request(url)
                        .post(path)
                        .set('Authorization', 'Basic ' + apiKey)
                        .send(voidingStatementMock)
                        .end(function(err, res) {
                            if (err) {
                                throw err;
                            }
                            res.statusCode.should.equal(409);
                            done();
                        });
                });

                it('should send 400 when try to void voiding statement', function(done) {
                    voidingStatementMock.object.id = voidingStatementMock.id;
                    voidingStatementMock.id = uuid.v4();

                    request(url)
                        .post(path)
                        .set('Authorization', 'Basic ' + apiKey)
                        .send(voidingStatementMock)
                        .end(function(err, res) {
                            if (err) {
                                throw err;
                            }
                            res.statusCode.should.equal(400);
                            done();
                        });
                });

                it('should send 400 when try to void non existing entity', function(done) {
                    voidingStatementMock.object.id = uuid.v4();

                    request(url)
                        .post(path)
                        .set('Authorization', 'Basic ' + apiKey)
                        .send(voidingStatementMock)
                        .end(function(err, res) {
                            if (err) {
                                throw err;
                            }
                            res.statusCode.should.equal(400);
                            done();
                        });
                });
            });

            describe('HTTP PUT', function() {
                it('should create entity for non existing id', function(done) {
                    var id = '5451066b1300173c3a90d108';

                    request(url)
                        .put(path + '?statementId=' + id)
                        .set('Authorization', 'Basic ' + apiKey)
                        .send(statementMock)
                        .end(function(err, res) {
                            if (err) {
                                throw err;
                            }
                            res.statusCode.should.equal(204);
                            done();
                        });
                });

                it('should return 409 for existing id', function(done) {
                    request(url)
                        .put(path + '?statementId=' + id)
                        .set('Authorization', 'Basic ' + apiKey)
                        .send(statementMock)
                        .end(function(err, res) {
                            if (err) {
                                throw err;
                            }
                            res.statusCode.should.equal(409);
                            done();
                        });
                });
            });
        });
    });
});
