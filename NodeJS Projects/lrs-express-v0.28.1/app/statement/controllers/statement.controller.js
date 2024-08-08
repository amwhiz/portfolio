'use strict';

var Bluebird = require('bluebird'),
    access = require('safe-access'),
    _ = require('lodash'),
    statementValidator = require('../lib/statement-validator/statement.validator.js'),
    statementParamsValidator = require('../lib/statement-params-validator/statementParamsValidator'),
    statementSanitizer = require('../lib/statement-sanitizer/statement.sanitizer.js'),
    statementService = require('../services/statement.service'),
    statementOptionsBuilder = require('../lib/statement-options-builder/statementOptionsBuilder'),
    StatementValidationError = require('../errors/StatementValidation.error'),
    NoStatementToVoidError = require('../errors/NoStatementToVoid.error'),
    CanNotVoidVoidingStatementError = require('../errors/CanNotVoidVoidingStatement.error'),
    BothIdError = require('../errors/BothId.error'),
    getStatements,
    getStatementById,
    isVoidingStatement,
    verbs = require('../lib/verbs/verbs');

exports.getStatements = function(req, res) {
    if (req.query.statementId || req.query.voidedStatementId) {
        getStatementById(req, res);
    } else {
        getStatements(req, res);
    }
};

getStatements = function(req, res) {
    Bluebird
        .resolve(statementOptionsBuilder.buildOptionsForMultipleGet(req.query))
        .then(function(options) {
            return statementService
                .getStatements(req.lrs._id, options);
        })
        .map(function(statement) {
            return statement.statement;
        })
        .then(function(statements) {
            res.sendData(statements);
        })
        .catch(function(error) {
            res.sendBadRequest(error);
        });
};

getStatementById = function(req, res) {
    Bluebird
        .resolve(statementParamsValidator.validateIds(req.query))
        .then(function(valid) {
            if (!valid) {
                throw new BothIdError();
            }

            return statementService
                .getStatementById(req.lrs._id, req.query.statementId || req.query.voidedStatementId);
        })
        .then(function(statement) {
            if (!statement) {
                res.sendNotFound();
            } else {
                res.sendData(statement.statement);
            }
        })
        .catch(function(error) {
            res.sendBadRequest(error);
        });
};

isVoidingStatement = function(statement) {
    return statement.verb.id === verbs.VOID_VERB && statement.object.objectType === 'StatementRef';
};

exports.createStatements = function(req, res, next) {
    statementService
        .arrayify(req.body)
        .each(function(statement) {
            statementSanitizer(statement);
        })
        .then(function(statements) {
            var errors = statementService.validateStatements(statements);

            if (!_.isEmpty(errors)) {
                throw new StatementValidationError(errors);
            }

            return statements;
        })
        .each(function(statement) {
            if (isVoidingStatement(statement)) {
                return statementService
                    .voidStatementThenCreate(req.lrs, statement);
            }

            return statementService
                .createStatement(req.lrs, statement);
        })
        .then(function(statements) {
            res.sendData(_.map(statements, 'id'));
        })
        .catch(CanNotVoidVoidingStatementError, StatementValidationError, NoStatementToVoidError, function(error) {
            res.sendBadRequest(error);
        })
        .catch(function(error) {
            if (access(error, 'code') === 11000) {
                res.sendConflict(error);
            } else {
                next(error);
            }
        });
};

exports.createStatement = function(req, res, next) {
    Bluebird
        .resolve(req.body)
        .then(function(statement) {
            statementSanitizer(statement);

            return statement;
        })
        .then(function(statement) {
            var errors = statementValidator.validate(statement);

            if (!_.isEmpty(errors)) {
                throw new StatementValidationError(errors);
            }

            return statement;
        })
        .then(function(statement) {
            if (isVoidingStatement(statement)) {
                return statementService
                    .voidStatementThenCreate(req.lrs, statement, req.query.statementId);
            }

            return statementService
                .createStatement(req.lrs, statement, req.query.statementId);
        })
        .then(function() {
            res.sendNoContent();
        })
        .catch(StatementValidationError, function(error) {
            res.sendBadRequest(error);
        })
        .catch(function(error) {
            if (access(error, 'code') === 11000) {
                res.sendConflict(error);
            } else {
                next(error);
            }
        });
};
