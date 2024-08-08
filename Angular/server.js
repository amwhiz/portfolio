'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const cors = require('cors');
const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const cuid = require('cuid');
const _ = require('lodash');

const config = require('./config.json');
const app = express();

const api = require('./server/routes/api');

// cuid
const requestId = (req, res, next) => {
  req.requestId = cuid();
  next();
};

const userId = (req, res, next) => {
  let token = null;
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }
  if (token != null) {
    jwt.verify(token, config.JwtSecretKey, function(err, decoded) {
      return req.userId = _.get(decoded, 'user.id', 0);
    });
  }
  next();
};

app.use(requestId);
app.use(userId);
// Cors
app.use(cors());

// Parsers
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true, parameterLimit: 100000}));

// Angular DIST output folder
app.use(express.static(path.join(__dirname, 'dist')));

// use JWT auth to secure the api, the token can be passed in the authorization header or querystring
app.use(expressJwt({
  secret: config.JwtSecretKey,
  getToken: function (req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      return req.query.token;
    }
    return null;
  }
}).unless({path: [
  { url: '/api/authenticate', methods: ['POST', 'OPTIONS']  },
  { url: /^(?:(?!\/api).)*$/, methods: ['GET', 'OPTIONS']  },
]}));

app.use(require('./server/middleware'));

// API location
app.use('/api', api);

// Send all other requests to the Angular app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

//Set Port
const port = process.env.PORT || '4200';
app.set('port', port);

const server = http.createServer(app);

/*eslint-disable */
server.listen(port, () => console.log(`Running on localhost:${port}`));
/*eslint-enable */
