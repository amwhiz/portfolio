'use strict';

module.exports = {
  EventNotFoundError: require('./EventNotFoundError'),
  SurveyNotFoundError: require('./SurveyNotFoundError'),
  EventCannotEditError: require('./EventCannotEditError'),
  SurveyCannotEditError: require('./SurveyCannotEditError'),
  EventCannotDeleteError: require('./EventCannotDeleteError'),
  SurveyCannotDeleteError: require('./SurveyCannotDeleteError'),
  EventAlreadyExistsError: require('./EventAlreadyExistsError'),
  SurveyAlreadyExistsError: require('./SurveyAlreadyExistsError')
};