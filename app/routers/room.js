const express = require('express');
const randomstring = require('randomstring');
const lodash = require('lodash');

const Room = require('../models/room');

const createRouter = () => {
  const router = express.Router();

  // router.route('*')
  //   .all((request, response, next) => {
  //     console.log(request.params, request.query, request.body);
  //     next();
  //   });

  router.route('/')
    .get((request, response, next) => {
      Room.find().exec()
        .then((rooms) => response.json(rooms))
        .catch(() => response.sendStatus(400));
    })
    .post((request, response, next) => {
      const id = randomstring.generate(8);
      const name = (request.body.name || request.query.name);

      const room = new Room({ id, name });

      room.save()
        .then(() => response.json(room))
        .catch(() => response.sendStatus(400));
    });

  router.route('/:id')
    .get((request, response, next) => {
      const { id } = request.params;

      Room.get(id)
        .then((room) => {
          if (room) {
            response.json(room);
          }
          else {
            response.sendStatus(404);
          }
        })
        .catch(() => response.sendStatus(400));
    })
    .put((request, response, next) => {
      const { id } = request.params;
      const name = (request.body.name || request.query.name);

      Room.get(id)
        .then((room) => {
          if (room) {
            room.name = name;
            room.save().then(() => response.json(room));
          }
          else {
            response.sendStatus(404);
          }
        })
        .catch(() => response.sendStatus(400));
    })
    .delete((request, response, next) => {
      const { id } = request.params;

      Room.remove({ id }).exec()
        .then(() => response.json({ id }))
        .catch(() => response.sendStatus(400));
    });

  return router;
};

module.exports = createRouter;
