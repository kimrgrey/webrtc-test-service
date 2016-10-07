const socketIo = require('socket.io');
const randomstring = require('randomstring');

const clients = {};

const __generateClientId = () => randomstring.generate(8);

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
  client.id = __generateClientId();

  clients[client.id] = client;

  client.on('join',       (params) => onClientJoin(client, params));
  client.on('leave',      (params) => onClientLeave(client, params));
  client.on('webrtc',     (params) => onClientWebRTC(client, params));
  client.on('disconnect', (params) => onClientDisconnect(client, params));

  __emit(client, 'registered', { id: client.id });
};

const onClientJoin = (client, params) => {
  const { room } = JSON.parse(params);

  if (client.room !== undefined) {
      __broadcast(client, 'left', { user_id: client.id });
      client.leave(client.room);
  }

  client.room = room;
  client.join(room);

  __broadcast(client, 'joined', { user_id: client.id });
  __emit(client, 'members', { ids: clients.keys() });
};

const onClientLeave = (client, params) => {
  if (client.room !== undefined) {
    __broadcast(client, 'left', { user_id: client.id });
    client.leave(client.room);
  }

  delete client.room;
};

const onClientWebRTC = (client, params) => {
  const { receiver } = JSON.parse(params);

  if (receiver !== undefined && client[receiver] !== undefined) {
    __emit(clients[receiver], 'webrtc', params);
  }
  else {
    __broadcast(client, 'webrtc', params);
  }
};

const onClientDisconnect = (client, params) => {
  if (client.room !== undefined) {
    __broadcast(client, 'left', { user_id: client.id });
    client.leave(client.room);
  }

  delete clients[client.id];
};

module.exports = {
  init: initSocketIo
};
