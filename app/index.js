const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const logger = require('./utils/logger');

const websocket = require('./websocket');

const roomRouter = require('./routers/room');

const roomStorage = require('./models/rooms');

const application = express();
const server = http.createServer(application);

websocket.init(server);

application.use(logger);
application.use(cors());
application.use(bodyParser.urlencoded({ extended: true }));
application.use(bodyParser.json());
application.use('/rooms', roomRouter(roomStorage));

const applicationPort = process.env.PORT || 3000;

server.listen(applicationPort, () => {
  console.log('started on', applicationPort);
});
