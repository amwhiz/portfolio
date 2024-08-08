'use strict';

var expect = require('chai').expect,
    _ = require('lodash'),
    configValidator = require('../../../lib/validation/configValidator'),
    RandExp = require('randexp');

describe('Unit tests', function() {
    describe('Config validation', function() {
        var validConfiguration,
            invalidConfiguration;

        it('should exist', function(done) {
            expect(configValidator).to.exist();
            done();
        });

        beforeEach(function(done) {
            validConfiguration = {
                schema: 'http',
                hostname: 'testapi.english.com',
                port: null,
                pathname: '/dna/v0.9',
                oauth: {
                    clientId: '123',
                    clientSecret: '123'
                }
            };

            invalidConfiguration = {};
            done();
        });

        describe('method', function() {
            describe('validate', function() {
                it('should be a function', function(done) {
                    expect(configValidator.validate).to.be.instanceOf(Function);
                    done();
                });

                it('should return true if configuration is valid', function(done) {
                    expect(configValidator.validate(validConfiguration)).to.be.true();
                    done();
                });

                it('should return false if configuration is invalid', function(done) {
                    var invalidConfiguration = {};

                    expect(configValidator.validate(invalidConfiguration)).to.be.false();
                    done();
                });
            });

            describe('getErrors', function() {
                it('should be a function', function(done) {
                    expect(configValidator.getErrors).to.be.instanceOf(Function);
                    done();
                });

                it('should return empty array for valid configuration', function(done) {
                    var errors = configValidator.getErrors(validConfiguration);

                    expect(errors).to.be.instanceof(Array);
                    expect(errors).to.be.empty();
                    done();
                });

                it('should return not empty array for invalid configuration', function(done) {
                    var errors = configValidator.getErrors(invalidConfiguration);

                    expect(errors).to.be.instanceof(Array);
                    expect(errors).to.be.not.empty();
                    done();
                });
            });
        });

        describe('error message', function() {
            function pluckInvalidFieldsNames(configuration) {
                return _.pluck(configValidator.getErrors(configuration), 'path');
            }

            describe('for \'schema\'', function() {
                var allowedRegexPattern = 'https?',
                    disallowedRegexPattern = '^(?!(?:' + allowedRegexPattern + ')$).*$', // @see http://stackoverflow.com/questions/2637675/how-to-negate-the-whole-regex
                    allowedRegex = new RegExp(allowedRegexPattern),
                    disallowedRegex = new RegExp(disallowedRegexPattern),
                    allowedSchemaGenerator = new RandExp(allowedRegex),
                    disallowedSchemaGenerator = new RandExp(disallowedRegex);

                describe('should NOT occur if ', function() {
                    it('matches /' + allowedRegexPattern + '/', function(done) {
                        var testNumber = 10;

                        while (testNumber-- > 0) {
                            validConfiguration.schema = allowedSchemaGenerator.gen();
                            expect(pluckInvalidFieldsNames(validConfiguration)).not.to.contain('schema');
                        }

                        done();
                    });

                    describe('is falsy, that is to say', function() {
                        var falsyValues = {
                            null: null,
                            undefined: undefined,
                            false: false
                        };

                        it('is not present', function(done) {
                            delete validConfiguration.schema;
                            expect(pluckInvalidFieldsNames(validConfiguration)).not.to.contain('schema');
                            done();
                        });

                        _.forEach(falsyValues, function(falsyValue, falsyValueLabel) {
                            it('is \'' + falsyValueLabel + '\'', function(done) {
                                validConfiguration.schema = falsyValue;
                                expect(pluckInvalidFieldsNames(validConfiguration)).not.to.contain('schema');
                                done();
                            });
                        });
                    });
                });

                it('should occur if doesn\'t match /' + allowedRegexPattern + '/', function(done) {
                    var testNumber = 10;

                    while (testNumber-- > 0) {
                        validConfiguration.schema = disallowedSchemaGenerator.gen();
                        expect(pluckInvalidFieldsNames(validConfiguration)).to.contain('schema');
                    }

                    done();
                });
            });

            describe('for \'hostname\'', function() {
                describe('should occur if', function() {
                    it('is empty string', function(done) {
                        validConfiguration.hostname = '';
                        expect(pluckInvalidFieldsNames(validConfiguration)).to.contain('hostname');
                        done();
                    });

                    describe('is not present', function() {
                        it('should occur', function(done) {
                            delete validConfiguration.hostname;
                            expect(pluckInvalidFieldsNames(validConfiguration)).to.contain('hostname');
                            done();
                        });
                    });

                    describe('is not a string, but', function() {
                        var notStrings = {
                            'a number': 1,
                            'an object': {},
                            'an array': [],
                            'a function': _.identity,
                            null: null,
                            undefined: undefined,
                            false: false,
                            true: true
                        };

                        _.forEach(notStrings, function(notStringValue, notStringValueLabel) {
                            it(notStringValueLabel, function(done) {
                                validConfiguration.hostname = notStringValue;
                                expect(pluckInvalidFieldsNames(validConfiguration)).to.contain('hostname');
                                done();
                            });
                        });
                    });
                });
            });

            describe('for \'port\'', function() {
                describe('should occur if', function() {
                    describe('is not a number, but', function() {
                        var notNumber = {
                            'a string': 'aaa',
                            'an object': {},
                            'an array': [],
                            'a function': _.identity
                        };

                        _.forEach(notNumber, function(notNumberValue, notNumberValueLabel) {
                            it(notNumberValueLabel, function(done) {
                                validConfiguration.port = notNumberValue;
                                expect(pluckInvalidFieldsNames(validConfiguration)).to.contain('port');
                                done();
                            });
                        });
                    });

                    it('if below 0', function(done) {
                        validConfiguration.port = -1;
                        expect(pluckInvalidFieldsNames(validConfiguration)).to.contain('port');
                        done();
                    });

                    it('if above 65535', function(done) {
                        validConfiguration.port = 65535 + 1;
                        expect(pluckInvalidFieldsNames(validConfiguration)).to.contain('port');
                        done();
                    });
                });

                describe('should NOT occur if ', function() {
                    describe('is falsy, that is to say', function() {
                        var falsyValues = {
                            null: null,
                            undefined: undefined,
                            false: false
                        };

                        it('is not present', function(done) {
                            delete validConfiguration.port;
                            expect(pluckInvalidFieldsNames(validConfiguration)).not.to.contain('port');
                            done();
                        });

                        _.forEach(falsyValues, function(falsyValue, falsyValueLabel) {
                            it('is \'' + falsyValueLabel + '\'', function(done) {
                                validConfiguration.port = falsyValue;
                                expect(pluckInvalidFieldsNames(validConfiguration)).not.to.contain('port');
                                done();
                            });
                        });
                    });
                });
            });

            describe('for \'pathname\'', function() {
                describe('should occur if', function() {
                    it('is empty string', function(done) {
                        validConfiguration.pathname = '';
                        expect(pluckInvalidFieldsNames(validConfiguration)).to.contain('pathname');
                        done();
                    });

                    describe('is not present', function() {
                        it('should occur', function(done) {
                            delete validConfiguration.pathname;
                            expect(pluckInvalidFieldsNames(validConfiguration)).to.contain('pathname');
                            done();
                        });
                    });

                    describe('is not a string, but', function() {
                        var notStrings = {
                            'a number': 1,
                            'an object': {},
                            'an array': [],
                            'a function': _.identity,
                            null: null,
                            undefined: undefined,
                            false: false,
                            true: true
                        };

                        _.forEach(notStrings, function(notStringValue, notStringValueLabel) {
                            it(notStringValueLabel, function(done) {
                                validConfiguration.pathname = notStringValue;
                                expect(pluckInvalidFieldsNames(validConfiguration)).to.contain('pathname');
                                done();
                            });
                        });
                    });
                });
            });

            describe('for \'oauth\'', function() {
                describe('should occur if', function() {
                    describe('is falsy, that is to say', function() {
                        var falsyValues = {
                            null: null,
                            undefined: undefined,
                            false: false
                        };

                        it('is not present', function(done) {
                            delete validConfiguration.oauth;
                            expect(pluckInvalidFieldsNames(validConfiguration)).to.contain('oauth');
                            done();
                        });

                        _.forEach(falsyValues, function(falsyValue, falsyValueLabel) {
                            it('is \'' + falsyValueLabel + '\'', function(done) {
                                validConfiguration.oauth = falsyValue;
                                expect(pluckInvalidFieldsNames(validConfiguration)).to.contain('oauth');
                                done();
                            });
                        });
                    });

                    describe('is not an object, but', function() {
                        var notObject = {
                            'a string': 'aaa',
                            'a number': 1,
                            'an array': [],
                            'a function': _.identity
                        };

                        _.forEach(notObject, function(notObject, notObjectValueLabel) {
                            it(notObjectValueLabel, function(done) {
                                validConfiguration.oauth = notObject;
                                expect(pluckInvalidFieldsNames(validConfiguration)).to.contain('oauth');
                                done();
                            });
                        });
                    });

                    it('doesn\'t have a valid clientId property', function(done) {
                        validConfiguration.oauth = {};
                        expect(pluckInvalidFieldsNames(validConfiguration)).to.contain('oauth.clientId');
                        done();
                    });

                    it('doesn\'t have a valid clientSecret property', function(done) {
                        validConfiguration.oauth = {};
                        expect(pluckInvalidFieldsNames(validConfiguration)).to.contain('oauth.clientSecret');
                        done();
                    });

                });

                describe('should NOT occur if', function() {
                    describe('contains value of type', function() {
                        var validValues = {
                            object: {}
                        };

                        _.forEach(validValues, function(value, label) {
                            it(label + ' with proper clientId and clientSecret properties', function(done) {
                                validConfiguration.oauth = {
                                    clientId: '123',
                                    clientSecret: '123'
                                };

                                expect(pluckInvalidFieldsNames(validConfiguration)).not.to.contain('oauth');
                                expect(pluckInvalidFieldsNames(validConfiguration)).not.to.contain('oauth.clientId');
                                expect(pluckInvalidFieldsNames(validConfiguration)).not.to.contain('oauth.clientSecret');
                                done();
                            });
                        });
                    });
                });
            });

            describe('for \'query\'', function() {
                describe('should occur if', function() {
                    describe('is not an object, but', function() {
                        var notObject = {
                            'a string': 'aaa',
                            'a number': 1,
                            'an array': [],
                            'a function': _.identity
                        };

                        _.forEach(notObject, function(notObject, notObjectValueLabel) {
                            it(notObjectValueLabel, function(done) {
                                validConfiguration.query = notObject;
                                expect(pluckInvalidFieldsNames(validConfiguration)).to.contain('query');
                                done();
                            });
                        });
                    });

                    describe('contains value other then string or number or boolean, but', function() {
                        var notStringsNorNumbersNorBooleanNorFalsy = {
                            'an object': {},
                            'an array': [],
                            'a function': _.identity
                        };

                        _.forEach(notStringsNorNumbersNorBooleanNorFalsy, function(value, label) {
                            it(label, function(done) {
                                var fieldName = 'queryField';

                                validConfiguration.query = {};

                                validConfiguration.query[fieldName] = value;
                                expect(pluckInvalidFieldsNames(validConfiguration)).to.contain('query.' + fieldName);
                                done();
                            });
                        });
                    });
                });

                describe('should NOT occur if', function() {
                    describe('is falsy, that is to say', function() {
                        var falsyValues = {
                            null: null,
                            undefined: undefined,
                            false: false
                        };

                        it('is not present', function(done) {
                            delete validConfiguration.query;
                            expect(pluckInvalidFieldsNames(validConfiguration)).not.to.contain('query');
                            done();
                        });

                        _.forEach(falsyValues, function(falsyValue, falsyValueLabel) {
                            it('is \'' + falsyValueLabel + '\'', function(done) {
                                validConfiguration.query = falsyValue;
                                expect(pluckInvalidFieldsNames(validConfiguration)).not.to.contain('query');
                                done();
                            });
                        });
                    });

                    describe('contains value of type', function() {
                        var validValues = {
                            string: 'string',
                            number: 1,
                            'boolean [true]': true,
                            'boolean [false]': false
                        };

                        _.forEach(validValues, function(value, label) {
                            it(label, function(done) {
                                var fieldName = 'queryField';

                                validConfiguration.query = {};

                                validConfiguration.query[fieldName] = value;
                                expect(pluckInvalidFieldsNames(validConfiguration)).not.to.contain('query.' + fieldName);
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});
