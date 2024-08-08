'use strict';

const _ = require('lodash');

const mysql = require('../lib/mysql');
const errors = require('../errors/errors');
const surveyValidation = require('../validation/surveys.validator');
const surveys = {};

let sort = {
  'survey_name': 'ORDER BY s.name ASC',
  '-survey_name': 'ORDER BY s.name DESC',
  'events': 'ORDER BY events ASC',
  '-events': 'ORDER BY events DESC',
  'total_entries': 'ORDER BY total_entries ASC',
  '-total_entries': 'ORDER BY total_entries DESC'
};

function getSurveyById(surveyId) {
  let getSurvey = 'SELECT s.*, COUNT(DISTINCT es.id) as events, COUNT(DISTINCT se.id) as total_entries FROM surveys as s LEFT JOIN event_survey AS es ON es.survey_id = s.id ' +
                  'LEFT JOIN survey_entries as se ON se.survey_id = s.id WHERE s.status = 1 AND s.id = ? GROUP BY s.id';

  return mysql.query(getSurvey, [surveyId]);
}

function checkSurveyExistance(surveyId) {
  let checkSurvey = 'SELECT COUNT(*) AS count FROM surveys WHERE id = ? AND status = 1';

  return mysql.query(checkSurvey, [surveyId]);
}

function checkSurveyEvents(surveyId) {
  let checkSurveyEvents = 'SELECT COUNT(*) AS count FROM event_survey WHERE survey_id = ?';

  return mysql.query(checkSurveyEvents, [surveyId]);
}

function checkSurveyBuilder(surveyId) {
  let checkSurveyEvents = 'SELECT COUNT(*) AS count FROM survey_builder WHERE survey_id = ?';

  return mysql.query(checkSurveyEvents, [surveyId]);
}

function insertSurveyBuilder(surveyId, question) {
  let insertQuery = 'INSERT INTO `survey_builder` (survey_id, questions) VALUES (?, ?)';

  return mysql.query(insertQuery, [surveyId, question]);
}

function updateSurveyBuilder(surveyId, question) {
  let insertQuery = 'UPDATE `survey_builder` SET questions = ? WHERE survey_id = ?';

  return mysql.query(insertQuery, [question, surveyId]);
}

function uniqueSurveyValidation(name) {
  let uniqueSurveyQuery = 'SELECT id FROM surveys WHERE name = ?';

  return mysql.query(uniqueSurveyQuery, [name]);
}

surveys.getAll = (req, res) => {
  let skip = parseInt(_.get(req, 'query.offset', 0)),
    limit = parseInt(_.get(req, 'query.limit', 10)),
    data = {},
    sorting = sort[_.get(req, 'query.sortby')] || ' ';

  let countQuery = 'SELECT COUNT(*) as count FROM surveys WHERE status = 1',
    surveyQuery = 'SELECT s.*, COUNT(DISTINCT es.id) as events, COUNT(DISTINCT se.id) as total_entries FROM surveys as s LEFT JOIN event_survey AS es ON es.survey_id = s.id ' +
                  'LEFT JOIN survey_entries as se ON se.survey_id = s.id WHERE s.status = 1 GROUP BY s.id '+ sorting + ' LIMIT ?, ?';

  return mysql.query(countQuery, [])
    .then(result => {
      data.pagination = {
        total_results: result[0].count,
        index: skip
      };

      return mysql.query(surveyQuery, [skip, limit]);
    })
    .then(surveys => {
      data.surveys = surveys;
      data.pagination.included_results = surveys.length;
      res.sendData(data);
    })
    .catch(err => {
      res.sendJsonHttpMessageWithError(500, err);
    });
};

surveys.save = (req, res) => {
  let payload = _.get(req, 'body'),
    userId = _.get(req, 'userId', null),
    validateError = surveyValidation.getErrors(payload);

  if (!_.isEmpty(validateError)) {
    return res.sendBadRequest(validateError);
  }

  let insertQuery = 'INSERT INTO `surveys` (name, client_name, created_by, updated_by) VALUES (?, ?, ?, ?)';
  return uniqueSurveyValidation(payload.name)
    .then(data => {
      if (data.length > 0) {
        throw new errors.SurveyAlreadyExistsError();
      }
      return mysql.query(insertQuery, [payload.name, payload.clientName, userId, userId]);
    })
    .then(result => {
      return [checkSurveyBuilder(_.get(result, 'insertId')), _.get(result, 'insertId')];
    })
    .then(result => {
      return [insertSurveyBuilder(result[1], JSON.stringify(payload.questions)), _.get(result, '[1]')];
    })
    .then(data => {
      return getSurveyById(_.get(data, '[1]'));
    })
    .then(data => {
      res.sendData(data, 'Survey created successfully');
    })
    .catch(err => {
      if (err instanceof errors.SurveyAlreadyExistsError) {
        return res.sendJsonHttpMessageWithError(409, err.getMessage());
      }
      res.sendJsonHttpMessageWithError(err);
    });
};

surveys.update = (req, res) => {
  let payload = _.get(req, 'body'),
    userId = _.get(req, 'userId'),
    surveyId = _.get(req, 'params.id', null),
    validateError = surveyValidation.getErrors(payload);

  if (!_.isEmpty(validateError)) {
    return res.sendBadRequest(validateError);
  }

  let updateSurvey = 'UPDATE `surveys` SET name= ?, client_name = ?, updated_by = ?, updated_at = ? WHERE id = ? AND status = 1';
  return uniqueSurveyValidation(payload.name)
    .then(data => {
      if ((data.length > 0) && (data[0].id != surveyId)) {
        throw new errors.SurveyAlreadyExistsError();
      }
      return checkSurveyExistance(surveyId);
    })
    .then(result => {
      if (result[0].count == 0) {
        throw new errors.SurveyNotFoundError();
      }

      return checkSurveyEvents(surveyId);
    })
    .then(response => {
      if (response[0].count > 0) {
        throw new errors.SurveyCannotEditError();
      }

      return mysql.query(updateSurvey, [payload.name, payload.clientName, userId, new Date(), surveyId]);
    })
    .then(() => {
      return checkSurveyBuilder(surveyId);
    })
    .then(result => {
      if (result[0].count == 0) {
        return insertSurveyBuilder(surveyId, JSON.stringify(payload.questions));
      } else {
        return updateSurveyBuilder(surveyId, JSON.stringify(payload.questions));
      }
    })
    .then(() => {
      return getSurveyById(surveyId);
    })
    .then(data => {
      res.sendData(data, 'Survey updated succesfully');
    })
    .catch(err => {
      if (err instanceof errors.SurveyCannotEditError) {
        return res.sendBadRequest(err.getMessage());
      } else if (err instanceof errors.SurveyNotFoundError) {
        return res.sendNotFound();
      } else if (err instanceof errors.SurveyAlreadyExistsError) {
        return res.sendJsonHttpMessageWithError(409, err.getMessage());
      }
      res.sendJsonHttpMessageWithError(500, err);
    });
};

surveys.delete = (req, res) => {
  let surveyId = _.get(req, 'params.id', null),
    userId = _.get(req, 'userId');

  let deleteSurvey = 'UPDATE `surveys` SET status = 0, updated_by = ?, updated_at = ? WHERE id = ? AND status = 1';
  return checkSurveyExistance(surveyId)
    .then(result => {
      if (result[0].count == 0) {
        throw new errors.SurveyNotFoundError();
      }

      return checkSurveyEvents(surveyId);
    })
    .then(response => {
      if (response[0].count > 0) {
        throw new errors.SurveyCannotDeleteError();
      }

      return mysql.query(deleteSurvey, [userId, new Date(), surveyId]);
    })
    .then(() => {
      res.sendData([], 'Survey deleted succesfully');
    })
    .catch(err => {
      if (err instanceof errors.SurveyCannotDeleteError) {
        return res.sendBadRequest(err.getMessage());
      } else if (err instanceof errors.SurveyNotFoundError) {
        return res.sendNotFound();
      }
      res.sendJsonHttpMessageWithError(500, err);
    });
};

surveys.get = (req, res) => {
  const surveyID = _.get(req, 'params.id');
  const query = 'SELECT s.id, s.name, s.client_name, sb.questions FROM surveys as s LEFT JOIN survey_builder as sb ON s.id = sb.survey_id WHERE status = 1 AND s.id = ?';

  return mysql.query(query, [surveyID])
    .then((row) => {
      if (!_.size(row)) {
        throw new errors.SurveyNotFoundError();
      }

      const returnObj = {
        id: _.get(row, '[0].id'),
        name: _.get(row, '[0].name'),
        client_name: _.get(row, '[0].client_name'),
        questions: JSON.parse(_.get(row, '[0].questions', {})),
      };
      res.sendData(returnObj);
    })
    .catch(err => {
      if (err instanceof errors.SurveyNotFoundError) {
        return res.sendNotFound();
      }
      res.sendJsonHttpMessageWithError(500, err);
    });
};

module.exports = surveys;
