const express = require('express');
const randomstring = require('randomstring');

const router = express.Router();

const roomToken = () => randomstring.generate(8);

router.get('/', (request, response) => {
  response.json({
    token: roomToken()
  });
});

module.exports = router;
