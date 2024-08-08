'use strict';

var expect = require('chai').expect,
    actorValidator = require('../../../lib/statement-validator/validators/actor.validator'),
    messages = require('../../../lib/validator/validator.messages'),
    _ = require('lodash'),
    errors;

describe('Unit tests', function() {
    describe('Actor Validator', function() {
        beforeEach(function() {
            errors = [];
        });

        it('should exist', function() {
            expect(actorValidator).to.exist();
        });

        it('should return errors for empty object actor', function() {
            var obj = {};

            errors = actorValidator(obj);
            expect(errors.length).to.equal(11);
            expect(errors).to.include(messages.REQUIRED('actor'));
        });

        it('should return errors for empty actor', function() {
            var obj = {
                actor: {}
            };

            errors = actorValidator(obj);
            expect(errors.length).to.equal(10);
            expect(errors).to.include(messages.REQUIRED('actor'));
        });

        it('should return errors for empty objectType', function() {
            var obj = {
                actor: {
                    objectType: ''
                }
            };

            errors = actorValidator(obj);
            expect(errors.length).to.equal(8);
            expect(errors).to.include(messages.REQUIRED('actor.objectType'));
        });

        it('should return errors for objectType value other then Agent', function() {
            var obj = {
                actor: {
                    objectType: 'dsa'
                }
            };

            errors = actorValidator(obj);
            expect(errors.length).to.equal(7);
            expect(errors).to.include(messages.VALUE('actor.objectType', 'Agent'));
        });

        it('should return errors for empty account', function() {
            var obj = {
                actor: {
                    objectType: 'Agent',
                    account: {}
                }
            };

            errors = actorValidator(obj);
            expect(errors.length).to.equal(5);
            expect(errors).to.include(messages.REQUIRED('actor.account'));
        });

        it('should return errors for no object account', function() {
            var obj = {
                actor: {
                    objectType: 'Agent',
                    account: 'asd'
                }
            };

            errors = actorValidator(obj);
            expect(errors.length).to.equal(5);
            expect(errors).to.include(messages.OBJECT('actor.account'));
        });

        it('should return errors for no account homePage', function() {
            var obj = {
                actor: {
                    objectType: 'Agent',
                    account: {
                        1: 1
                    }
                }
            };

            errors = actorValidator(obj);
            expect(errors.length).to.equal(4);
            expect(errors).to.include(messages.REQUIRED('actor.account.homePage'));
        });

        it('should return errors for empty account homePage', function() {
            var obj = {
                actor: {
                    objectType: 'Agent',
                    account: {
                        homePage: ''
                    }
                }
            };

            errors = actorValidator(obj);
            expect(errors.length).to.equal(4);
            expect(errors).to.include(messages.REQUIRED('actor.account.homePage'));
        });

        it('should return errors for no iri account homePage', function() {
            var obj = {
                actor: {
                    objectType: 'Agent',
                    account: {
                        homePage: 'dsa'
                    }
                }
            };

            errors = actorValidator(obj);
            expect(errors.length).to.equal(3);
            expect(errors).to.include(messages.IRI('actor.account.homePage'));
        });

        it('should return errors for no account name', function() {
            var obj = {
                actor: {
                    objectType: 'Agent',
                    account: {
                        homePage: 'http://google.com'
                    }
                }
            };

            errors = actorValidator(obj);
            expect(errors.length).to.equal(2);
            expect(errors).to.include(messages.REQUIRED('actor.account.name'));
        });

        it('should return errors for no account name', function() {
            var obj = {
                actor: {
                    objectType: 'Agent',
                    account: {
                        homePage: 'http://google.com'
                    }
                }
            };

            errors = actorValidator(obj);
            expect(errors.length).to.equal(2);
            expect(errors).to.include(messages.REQUIRED('actor.account.name'));
        });

        it('should return errors for empty account name', function() {
            var obj = {
                actor: {
                    objectType: 'Agent',
                    account: {
                        homePage: 'http://google.com',
                        name: ''
                    }
                }
            };

            errors = actorValidator(obj);
            expect(errors.length).to.equal(1);
            expect(errors).to.include(messages.REQUIRED('actor.account.name'));
        });

        it('should return no errors for proper actor', function() {
            var obj = {
                actor: {
                    objectType: 'Agent',
                    account: {
                        homePage: 'http://google.com',
                        name: 'dsa'
                    }
                }
            };

            errors = actorValidator(obj);
            expect(errors.length).to.equal(0);
            expect(errors).to.not.include(messages.REQUIRED('actor.account.name'));
        });
    });
});
