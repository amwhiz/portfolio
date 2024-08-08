'use strict';

function SurveyNotFoundError() {
  this.getMessage = function() {
    return 'The requested survey not found' ;
  };
}

require('util').inherits(SurveyNotFoundError, Error);

module.exports = SurveyNotFoundError;
