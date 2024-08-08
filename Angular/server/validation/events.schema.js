'use strict';

const BaseJoi = require('joi');
const Extension = require('joi-date-extensions');
const Joi = BaseJoi.extend(Extension);

module.exports = Joi.object().keys({
  name: Joi.string().required(),
  start_date: Joi.date().format('YYYY-MM-DD').required(),
  end_date: Joi.date().format('YYYY-MM-DD').required(),
  survey_id: Joi.number().required()
});
