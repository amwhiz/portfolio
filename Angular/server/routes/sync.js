'use strict';

const _ = require('lodash');
const mysql = require('../lib/mysql');
const sync = {};

function parseLodash(str) {
  let data = _.attempt(JSON.parse.bind(null, str));
  _.remove(data.en, function(n) { return n.pageNo === 1; });
  _.remove(data.es, function(n) { return n.pageNo === 1; });
  return data;
}

sync.getAll = (req, res) => {
  let response = {
    metaData: {
      totalEvents: 0,
      totalSurveys: 0
    }
  };

  let query = 'SELECT COUNT(DISTINCT `event_id`) AS totalEvents, COUNT(`survey_id`) AS totalSurveys FROM survey_entries';

  return mysql.query(query)
    .then(data => {
      response.metaData.totalEvents = _.get(data, '[0].totalEvents', 0);
      response.metaData.totalSurveys = _.get(data, '[0].totalSurveys', 0);
      return;
    })
    .then(() => {
      let query = 'SELECT `e`.`id`, `e`.`name`, DATE_FORMAT(`e`.`start_date`, "%c-%e-%Y") AS startDate, DATE_FORMAT(`e`.`end_date`, "%c-%e-%Y") AS endDate, `e`.`last_synced` AS lastSynced, (SELECT COUNT(`se`.`event_id`) FROM survey_entries se WHERE `se`.`event_id` = `e`.`id`) AS totalEntries, `es`.`survey_id` AS surveyId, `s`.`name` AS surveyName FROM events e INNER JOIN event_survey es ON `e`.`id` = `es`.`event_id` LEFT JOIN surveys s ON `s`.`id` = `es`.`survey_id` WHERE `e`.`status` = ? AND `e`.`end_date` >= DATE(NOW()) AND `es`.`survey_id` IS NOT NULL ORDER BY `e`.`start_date` DESC';
      return mysql.query(query, [1])
        .then(data => {
          response['events'] = data;
          return;
        });
    })
    .then(() => {
      let query = 'SELECT DISTINCT(`s`.`id`), `s`.`name`, `sb`.`questions` FROM surveys s INNER JOIN event_survey es ON `s`.`id` = `es`.`survey_id` INNER JOIN survey_builder sb ON `s`.`id` = `sb`.`survey_id` WHERE `s`.`status` = ?';
      return mysql.query(query, [1])
        .then(rows => {
          if (!_.isUndefined(rows) && _.size(rows)) {
            _.map(rows, function (v) {
              return v['questions'] = parseLodash(v['questions']);
            });
          }
          response['surveys'] = rows || [];
          return;
        });
    })
    .then(() => {
      res.sendData(response);
    })
    .catch(err => {
      res.sendJsonHttpMessageWithError(500, err);
    });
};

sync.save = (req, res) => {
  let event_id = _.get(req, 'body.event_id'),
    survey_id = _.get(req, 'body.survey_id'),
    surveys = _.get(req, 'body.surveys');

  if (!_.size(surveys)) {
    return res.sendJsonHttpMessage(400);
  }

  let query = 'INSERT INTO survey_entries (`survey_id`, `event_id`, `language`, `survey_date`, `answer`) VALUES ?';
  let values = [];

  _.forEach(surveys, (v) => {
    values.push([
      survey_id,
      event_id,
      _.get(v, 'language'),
      _.get(v, 'created_at'),
      JSON.stringify(_.get(v, 'answers'))
    ]);
  });

  return mysql.query(query, [values])
    .then(data => {
      res.sendData(data);
    })
    .catch(err => {
      res.sendJsonHttpMessageWithError(500, err);
    });
};

module.exports = sync;
