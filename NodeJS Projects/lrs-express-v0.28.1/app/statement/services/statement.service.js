'use strict';

var service = {},
    mongoose = require('mongoose'),
    StatementModel = mongoose.model('Statement'),
    Bluebird = require('bluebird'),
    _ = require('lodash'),
    VerbModel = mongoose.model('Verb'),
    ObjectModel = mongoose.model('Object'),
    ActorModel = mongoose.model('Actor'),
    statementValidator = require('../lib/statement-validator/statement.validator.js'),
    verbs = require('../lib/verbs/verbs'),
    access = require('safe-access'),
    NoStatementToVoidError = require('../errors/NoStatementToVoid.error'),
    CanNotVoidVoidingStatementError = require('../errors/CanNotVoidVoidingStatement.error');

Bluebird.promisifyAll(mongoose);

service.arrayify = Bluebird.method(function(data) {
    return _.isArray(data) ? data : [data];
});

service.validateStatements = function(statements) {
    return _.reduce(statements, function(errors, statement) {
        return errors.concat(statementValidator.validate(statement));
    }, []);
};

service.getStatements = function(lrsId, options) {
    var query = {
        'lrs._id': lrsId,
        voided: false
    };

    return StatementModel
        .find(query, '', options || {})
        .populate('statement.actor', '-_id')
        .populate('statement.verb', '-_id')
        .populate('statement.object', '-_id')
        .execAsync();
};

service.buildDefinition = function(lrs, statement) {
    return {
        name: 'collection',
        lrs: {
            _id: lrs._id,
            name: lrs.title
        },
        statement: statement
    };
};

service.voidStatementThenCreate = function(lrs, statement, id) {
    var query = {
        'lrs._id': lrs._id,
        'statement.id': statement.object.id
    };

    id = id || '';

    return StatementModel
        .findOne(query)
        .populate('statement.verb', '-_id')
        .then(function(statementToVoid) {
            if (!statementToVoid) {
                throw new NoStatementToVoidError();
            } else if (statementToVoid.statement.verb.id === verbs.VOID_VERB) {
                throw new CanNotVoidVoidingStatementError();
            } else {
                statementToVoid.voided = true;

                return statementToVoid
                    .saveAsync();
            }
        })
        .then(function() {
            return service.createStatement(lrs, statement, id);
        });
};

service.createStatement = function(lrs, statement, id) {
    var safeStatement = access(statement);

    return Bluebird
        .all([
            VerbModel.findOneOrCreateAsync({id: safeStatement('verb.id')}, safeStatement('verb')),
            ActorModel.findOneOrCreateAsync({'account.name': safeStatement('actor.account.name')}, safeStatement('actor')),
            ObjectModel.findOneOrCreateAsync({id: safeStatement('object.id')}, safeStatement('object'))
        ])
        .spread(function(verb, actor, object) {
            if (!_.isEmpty(id)) {
                statement.id = id;
            }
            statement.verb = verb;
            statement.actor = actor;
            statement.authority = actor;
            statement.object = object;

            return StatementModel
                .createAsync(service.buildDefinition(lrs, statement));
        });
};

service.getStatementById = function(lrsId, statementId) {
    var query = {
        'lrs._id': lrsId,
        'statement.id': statementId
    };

    return StatementModel
        .findOne(query)
        .populate('statement.actor', '-_id')
        .populate('statement.verb', '-_id')
        .populate('statement.object', '-_id')
        .execAsync();
};

module.exports = service;
