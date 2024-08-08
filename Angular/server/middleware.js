'use strict';

var http = require('http');

module.exports = function(req, res, next) {
  //request
  req.getContentType = function() {
    return req.get('Content-Type');
  };

  // response
  res.sendInvalidUsernameOrPassword = function () {
    return res.status(401).send({
      status: 401,
      data: null,
      message: 'Username or password is incorrect',
      request_id: req.requestId
    });
  };

  res.sendJson = function(status, object) {
    res.status(status).json(object);
  };

  res.sendJsonHttpMessage = function(status) {
    res.sendJson(status, {
      message: http.STATUS_CODES[status]
    });
  };

  res.sendJsonHttpMessageWithError = function(status, err) {
    res.sendJson(status, {
      status: status,
      request_id: req.requestId,
      data: null,
      error: err
    });
  };

  res.sendBadRequest = function(err) {
    res.sendJsonHttpMessageWithError(400, err);
  };

  res.sendUnauthorize = function() {
    res.sendJsonHttpMessage(401);
  };

  res.sendNoContent = function() {
    res.sendJsonHttpMessage(204);
  };

  res.sendConflict = function() {
    res.sendJsonHttpMessage(409);
  };

  res.sendNotFound = function() {
    res.sendJsonHttpMessage(404);
  };

  res.sendData = function(data, message) {
    res.sendJson(200, {
      status: 200,
      request_id: req.requestId,
      data: data,
      message: message || null
    });
  };

  next();
};
