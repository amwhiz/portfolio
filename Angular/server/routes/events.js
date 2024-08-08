'use strict';

const _ = require('lodash');

const mysql = require('../lib/mysql');
const errors = require('../errors/errors');
const eventValidation = require('../validation/events.validator');
const events = {};

let sort = {
  'event_name': 'ORDER BY e.name ASC',
  '-event_name': 'ORDER BY e.name DESC',
  'event_date': 'ORDER BY e.start_date ASC',
  '-event_date': 'ORDER BY e.start_date DESC',
  'last_synced': 'ORDER BY e.last_synced ASC',
  '-last_synced': 'ORDER BY e.last_synced DESC',
  'survey_name': 'ORDER BY s.name ASC',
  '-survey_name': 'ORDER BY s.name DESC',
  'total_entries': 'ORDER BY total_entries ASC',
  '-total_entries': 'ORDER BY total_entries DESC'
};

function getEventById(eventId) {
  let eventQuery = 'SELECT e.*, s.name as survey_name, COUNT(DISTINCT se.id) as total_entries FROM `events` as e LEFT JOIN `event_survey` as es ON es.event_id = e.id ' +
    'LEFT JOIN `surveys` as s ON s.id = es.survey_id LEFT JOIN `survey_entries` AS se ON se.event_id = e.id WHERE e.status=true AND e.id = ? GROUP BY e.id';

  return mysql.query(eventQuery, [eventId]);
}

function checkEventExistance(eventId) {
  let checkEvent = 'SELECT COUNT(*) AS count FROM events WHERE id = ?';

  return mysql.query(checkEvent, [eventId]);
}

function checkEventSurvey(eventId) {
  let checkEventSurvey = 'SELECT COUNT(*) AS count FROM event_survey WHERE event_id = ?';

  return mysql.query(checkEventSurvey, [eventId]);
}

function uniqueEventValidation(name) {
  let uniqueEventQuery = 'SELECT id FROM events WHERE name = ?';

  return mysql.query(uniqueEventQuery, [name]);
}

function getEventIdByEventSurveyId(id) {
  let uniqueEventQuery = 'SELECT * FROM event_survey WHERE id = ?';

  return mysql.query(uniqueEventQuery, [id]);
}

function updateEventSurvey(eventID, surveyID) {
  return checkEventSurvey(eventID)
    .then(data => {
      if (!data[0].count) {
        let insertQuery = 'INSERT INTO `event_survey` (event_id, survey_id) VALUES (?, ?)';
        return mysql.query(insertQuery, [eventID, surveyID]);
      } else {
        let updateQuery = 'UPDATE `event_survey` SET survey_id = ? WHERE event_id = ?';
        return mysql.query(updateQuery, [surveyID, eventID]);
      }
    });
}

events.getAll = (req, res) => {
  let skip = parseInt(_.get(req, 'query.offset', 0)),
    limit = parseInt(_.get(req, 'query.limit', 10)),
    data = {},
    sorting = sort[_.get(req, 'query.sortby')] || '';

  let countQuery = 'SELECT COUNT(*) as count FROM events WHERE status=true',
    eventQuery = 'SELECT e.*, s.name as survey_name, s.id as survey_id, COUNT(DISTINCT se.id) as total_entries FROM `events` as e LEFT JOIN `event_survey` as es ON es.event_id = e.id ' +
      'LEFT JOIN `surveys` as s ON s.id = es.survey_id LEFT JOIN `survey_entries` AS se ON se.event_id = e.id WHERE e.status=true GROUP BY e.id ' + sorting + ' LIMIT ?, ?';
  return mysql.query(countQuery, [])
    .then(result => {
      data.pagination = {
        total_results: result[0].count,
        index: skip
      };
      return mysql.query(eventQuery, [skip, limit]);
    })
    .then(events => {
      data.events = events;
      data.pagination.included_results = events.length;
      res.sendData(data);
    })
    .catch(err => {
      res.sendJsonHttpMessageWithError(500, err);
    });
};

events.save = (req, res) => {
  let payload = _.get(req, 'body'),
    userId = _.get(req, 'userId'),
    validateError = eventValidation.getErrors(payload);

  if (!_.isEmpty(validateError)) {
    return res.sendBadRequest(validateError);
  }

  let insertQuery = 'INSERT INTO `events` (name, start_date, end_date, created_by, updated_by) VALUES (?, ?, ?, ?, ?)';
  return uniqueEventValidation(payload.name)
    .then(data => {
      if (data.length > 0) {
        throw new errors.EventAlreadyExistsError();
      }
      return mysql.query(insertQuery, [payload.name, payload.start_date, payload.end_date, userId, userId]);
    })
    .then(result => {
      return [updateEventSurvey(_.get(result, 'insertId'), _.get(req, 'body.survey_id')), _.get(result, 'insertId')];
    })
    .then(result => {
      return getEventIdByEventSurveyId(_.get(result, '[1]'));
    })
    .then(result => {
      return getEventById(_.get(result[0], 'event_id'));
    })
    .then(data => {
      res.sendData(data, 'Event created successfully');
    })
    .catch(err => {
      if (err instanceof errors.EventAlreadyExistsError) {
        return res.sendJsonHttpMessageWithError(409, err.getMessage());
      }
      res.sendJsonHttpMessageWithError(500, err);
    });
};

events.update = (req, res) => {
  let payload = _.pick(_.get(req, 'body'), ['name', 'start_date', 'end_date', 'survey_id']),
    userId = _.get(req, 'userId'),
    eventId = _.get(req, 'params.id', null),
    validateError = eventValidation.getErrors(payload);

  if (!_.isEmpty(validateError)) {
    return res.sendBadRequest(validateError);
  }

  let updateEvent = 'UPDATE `events` SET name= ?, start_date = ?, end_date = ?, updated_by = ?, updated_at = ? WHERE id = ? AND status = 1';
  return uniqueEventValidation(payload.name)
    .then(data => {
      if ((data.length > 0) && (data[0].id != eventId)) {
        throw new errors.EventAlreadyExistsError();
      }
      return checkEventExistance(eventId);
    })
    .then(result => {
      if (result[0].count == 0) {
        throw new errors.EventNotFoundError();
      }

      return checkEventSurvey(eventId);
    })
    .then(() => {
      return mysql.query(updateEvent, [payload.name, payload.start_date, payload.end_date, userId, new Date(), eventId]);
    })
    .then(() => {
      return updateEventSurvey(eventId, _.get(req, 'body.survey_id'));
    })
    .then(() => {
      return getEventById(eventId);
    })
    .then(data => {
      res.sendData(data, 'Event updated succesfully');
    })
    .catch(err => {
      if (err instanceof errors.EventCannotEditError) {
        return res.sendBadRequest(err.getMessage());
      } else if (err instanceof errors.EventNotFoundError) {
        return res.sendNotFound();
      } else if (err instanceof errors.EventAlreadyExistsError) {
        return res.sendJsonHttpMessageWithError(409, err.getMessage());
      }
      res.sendJsonHttpMessageWithError(500, err);
    });
};

events.delete = (req, res) => {
  let eventId = _.get(req, 'params.id', null),
    userId = _.get(req, 'userId');

  let deleteEvent = 'UPDATE `events` SET status = 0, updated_by = ?, updated_at = ? WHERE id = ? AND status = 1';
  return checkEventExistance(eventId)
    .then(result => {
      if (result[0].count == 0) {
        throw new errors.EventNotFoundError();
      }

      return checkEventSurvey(eventId);
    })
    .then(() => {
      return mysql.query(deleteEvent, [userId, new Date(), eventId]);
    })
    .then(() => {
      res.sendData([], 'Event deleted succesfully');
    })
    .catch(err => {
      if (err instanceof errors.EventCannotDeleteError) {
        return res.sendBadRequest(err.getMessage());
      } else if (err instanceof errors.EventNotFoundError) {
        return res.sendNotFound();
      }
      res.sendJsonHttpMessageWithError(500, err);
    });
};

module.exports = events;
