const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');

const logger = require('./utils/logger');
const roomRouter = require('./routers/room');

const application = express();
const server = http.createServer(application);
const io = socketIo(server);

application.use(logger);
application.use(bodyParser.json());
application.use('/room', roomRouter);

const applicationPort = process.env.PORT || 3000;

application.listen(applicationPort, () => {
  console.log('started on', applicationPort);
});
