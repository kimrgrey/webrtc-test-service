const http = require('http');
const https = require('https');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const logger = require('./utils/logger');

const signalling = require('./signalling');

const roomRouter = require('./routers/room');

const roomStorage = require('./models/rooms');

const config = {
  certKeyPath: 'keys/webrtc.key',
  certCrt: 'keys/webrtc.crt',
};

const application = express();
// const server = http.createServer(application);
const server = https.createServer({
    key: fs.readFileSync(config.certKeyPath),
    cert: fs.readFileSync(config.certCrt),
    requestCert: true,
    rejectUnauthorized: false
 }, application)

signalling.init(server);

application.use(logger);
application.use(cors());
application.use(bodyParser.urlencoded({ extended: true }));
application.use(bodyParser.json());
application.use('/rooms', roomRouter(roomStorage));

const applicationHost = process.env.WEBRTC_HOST ||
                        process.env.HOST ||
                        'localhost';
const applicationPort = process.env.WEBRTC_PORT ||
                        process.env.PORT ||
                        3000;

server.listen(applicationPort, applicationHost, () => {
  console.log('started on', applicationHost + ':' + applicationPort);
});
