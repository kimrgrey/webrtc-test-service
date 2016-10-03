const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const logger = require('./utils/logger');
const roomRouter = require('./routers/room');

const websocket = require('./websocket');

const application = express();
const server = http.createServer(application);

websocket.init(server);

application.use(logger);
application.use(bodyParser.json());
application.use('/room', roomRouter);

const applicationPort = process.env.PORT || 3000;

server.listen(applicationPort, () => {
  console.log('started on', applicationPort);
});
