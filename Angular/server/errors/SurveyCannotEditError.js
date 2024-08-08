'use strict';

function SurveyCannotEditError() {
  this.getMessage = function() {
    return 'This survey can\'t be edited' ;
  };
}

require('util').inherits(SurveyCannotEditError, Error);

module.exports = SurveyCannotEditError;
