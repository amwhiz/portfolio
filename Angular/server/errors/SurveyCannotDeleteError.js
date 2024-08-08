'use strict';

function SurveyCannotDeleteError() {
  this.getMessage = function() {
    return 'This survey can\'t be deleted' ;
  };
}

require('util').inherits(SurveyCannotDeleteError, Error);

module.exports = SurveyCannotDeleteError;
