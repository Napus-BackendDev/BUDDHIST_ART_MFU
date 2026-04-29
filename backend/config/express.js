// app.js
const express = require('express');
const initialize = require("../helpers/initialize");
const middlewares = require('../middleware/middlewares');
const swagger = require('../swagger/swagger');
const routes = require('../server/routes/app.routes');
const cors = require('cors');
const { corsOptions } = require('./corsAndIP');

let isReady = false;

module.exports = function () {
  const app = express();

  // Swagger setup
  swagger(app);

  // Use standard CORS middleware immediately
  app.use(cors(corsOptions));

  // Debug middleware to log CORS requests
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      console.log(`CORS Preflight: ${req.method} ${req.url} from ${req.headers.origin}`);
    }
    next();
  });

  initialize.init(function (status) {
    if (status) {
      middlewares(app);

      // Load routes
      routes(app);

      app.get('/healthz', (req, res) => {
        if (isReady) {
          res.status(200).send('OK');
        } else {
          res.status(503).send('Service Unavailable');
        }
      });

      setTimeout(() => {
        isReady = true;
      }, 10000);
    }
  });

  return app;
};
