'use strict';

var validator = {};

validator.checkId = function(idFromParam, idFromBody){
    return idFromParam === idFromBody;
};

module.exports = validator;
