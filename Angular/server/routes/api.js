'use strict';

const express = require('express');
const router = express.Router();

const authentication = require('./authentication');
const events = require('./events');
const surveys = require('./surveys');
const sync = require('./sync');

// Authenticate login
router.post('/authenticate', authentication.authenticate);

// Events
router
  .get('/events', events.getAll)
  .post('/events', events.save)
  .put('/events/:id', events.update)
  .delete('/events/:id', events.delete);

// Surveys
router
  .get('/surveys', surveys.getAll)
  .get('/survey/:id', surveys.get)
  .post('/surveys', surveys.save)
  .put('/surveys/:id', surveys.update)
  .delete('/surveys/:id', surveys.delete);

// Sync
router
  .get('/sync', sync.getAll)
  .post('/sync', sync.save);

module.exports = router;
