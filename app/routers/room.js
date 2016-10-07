const express = require('express');
const randomstring = require('randomstring');
const lodash = require('lodash');

const generateRoomId = () => randomstring.generate(8);

const createRouter = (roomStorage) => {
  const router = express.Router();

  // router.route('*')
  //   .all((request, response, next) => {
  //     console.log(request.params, request.query, request.body);
  //     next();
  //   });

  router.route('/')
    .get((request, response, next) => {
      response.json(roomStorage);
    })
    .post((request, response, next) => {
      const name = (request.body.name || request.query.name);
      const id = generateRoomId();

      const room = { id, name };

      roomStorage.push(room);
      response.json(room);
    });

  router.route('/:id')
    .get((request, response, next) => {
      const { id } = request.params;
      const room = lodash.find(roomStorage, (r) => (r.id === id));

      if (!!room) {
        response.json(room);
      }
      else {
        response.sendStatus(404);
      }
    })
    .put((request, response, next) => {
      const { id } = request.params;
      const name = (request.body.name || request.query.name);

      const room = lodash.find(roomStorage, (r) => (r.id === id));

      if (!!room) {
        room.name = name;
        response.json(room);
      }
      else {
        response.sendStatus(404);
      }
    })
    .delete((request, response, next) => {
      const { id } = request.params;

      const rooms = lodash.remove(roomStorage, (r) => (r.id === id));

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
