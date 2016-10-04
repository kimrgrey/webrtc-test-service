const express = require('express');
const randomstring = require('randomstring');
const lodash = require('lodash');

const generateRoomId = () => randomstring.generate(8);

const createRouter = (roomStorage) => {
  const router = express.Router();

  router.route('/')
  .get((request, response, next) => {
    response.json(roomStorage);
  })
  .post((request, response, next) => {
    const room_name = (request.body.room_name || request.query.room_name);
    const room_id = generateRoomId();

    const room = { room_id, room_name };

    roomStorage.push(room);
    response.json(room);
  });

  router.route('/:room_id')
  .get((request, response, next) => {
    const { room_id } = request.params;
    const room = lodash.find(roomStorage, (r) => (r.room_id === room_id));

    if (!!room) {
      response.json(room);
    }
    else {
      response.sendStatus(404);
    }
  })
  .put((request, response, next) => {
    const { room_id } = request.params;
    const room_name = (request.body.room_name || request.query.room_name);

    const room = lodash.find(roomStorage, (r) => (r.room_id === room_id));

    if (!!room) {
      room.room_name = room_name;
      response.json(room);
    }
    else {
      response.sendStatus(404);
    }
  })
  .delete((request, response, next) => {
    const { room_id } = request.params;

    const rooms = lodash.remove(roomStorage, (r) => (r.room_id === room_id));

    if (rooms.length) {
      response.json(rooms[0]);
    }
    else {
      response.sendStatus(404);
    }
  });

  return router;
};

module.exports = createRouter;
