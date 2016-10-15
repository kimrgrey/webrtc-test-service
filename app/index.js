const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bluebird = require('bluebird');

const logger = require('./utils/logger');

const signalling = require('./signalling');

const roomRouter = require('./routers/room');

const application = express();
const server = http.createServer(application);

mongoose.Promise = bluebird;

mongoose.connect('mongodb://127.0.0.1:27017/webrtc_test_deb');

mongoose.connection.on('open', () => {
  console.log('database connected');
});
mongoose.connection.on('error', () => {
  console.log('database connection error');
});

signalling.init(server);

application.use(logger);
application.use(cors());
application.use(bodyParser.urlencoded({ extended: true }));
application.use(bodyParser.json());
application.use('/rooms', roomRouter());

const applicationHost = process.env.WEBRTC_HOST ||
                        process.env.HOST ||
                        'localhost';
const applicationPort = process.env.WEBRTC_PORT ||
                        process.env.PORT ||
                        3000;

server.listen(applicationPort, applicationHost, () => {
  console.log('started on', applicationHost + ':' + applicationPort);
});
