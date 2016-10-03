const socketIo = require('socket.io');

const clients = {};

const __emit = (receiver, message, params) => {
  receiver.emit(message, JSON.stringify(params));
};

const __broadcast = (sender, message, params) => {
  sender.broadcast.to(sender.room).emit(message, JSON.stringify(params));
};

const initSocketIo = (server) => {
  const io = socketIo(server);

  io.on('connection', (client) => onIoConnection(client));
};

const onIoConnection = (client) => {
  client.on('join',       (params) => onClientJoin(client, params));
  client.on('leave',      (params) => onClientLeave(client, params));
  client.on('disconnect', (params) => onClientDisconnect(client, params));
};

const onClientJoin = (client, params) => {
  const { user_id, room } = JSON.parse(params);

  if (client.room !== undefined) {
      __broadcast(client, 'left', { user_id: client.user_id });
      client.leave(client.room);
  }

  client.user_id = user_id;
  client.room = room;

  clients[client.user_id] = client;

  client.join(room);

  __broadcast(client, 'joined', { user_id: client.user_id });
};

const onClientLeave = (client, params) => {
  if (client.room !== undefined) {
    __broadcast(client, 'left', { user_id: client.user_id });
    client.leave(client.room);
  }

  delete client.room;
};

const onClientDisconnect = (client, params) => {
  if (client.room !== undefined) {
    __broadcast(client, 'left', { user_id: client.user_id });
    client.leave(client.room);
  }

  delete clients[client.user_id];
};

module.exports = {
  init: initSocketIo
};
