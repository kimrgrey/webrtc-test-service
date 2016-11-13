const socketIo = require('socket.io');
const randomstring = require('randomstring');

const clients = {};

const __generateClientId = () => randomstring.generate(8);

const __emit = (receiver, message, params) => {
  receiver.emit(message, params);
};

const __broadcast = (sender, message, params) => {
  // FIXME: not working broadcast.to(...)
  // sender.broadcast.to(sender.room).emit(message, params);

  Object.keys(clients)
    .map((id) => (clients[id]))
    .filter((client) => (client !== sender && client.room === sender.room))
    .forEach((client) => client.emit(message, params));
};

const initSocketIo = (server) => {
  const io = socketIo(server);

  io.on('connection', (client) => onIoConnection(client));
};

const onIoConnection = (client) => {
  client.id = __generateClientId();

  clients[client.id] = client;

  client.on('register',      (params) => onClientRegister(client, params));
  client.on('join',          (params) => onClientJoin(client, params));
  client.on('leave',         (params) => onClientLeave(client, params));
  client.on('webrtc',        (params) => onClientWebRTC(client, params));
  client.on('message',       (params) => onClientMessage(client, params));
  client.on('toggle-audio',  (params) => onClientToggleAudio(client, params));
  client.on('toggle-video',  (params) => onClientToggleVideo(client, params));
  client.on('disconnecting', (params) => onClientDisconnecting(client, params));
  client.on('disconnect',    (params) => onClientDisconnect(client, params));
};

const onClientRegister = (client, params) => {
  const { id } = JSON.parse(params);

  if (id) {
    if (id in clients) {
      __emit(client, 'register-failed');
      return;
    }

    delete clients[client.id];

    client.id = id;
    clients[client.id] = client;
  }

  __emit(client, 'registered', JSON.stringify({ id: client.id }));
};

const onClientJoin = (client, params) => {
  const { id, name } = JSON.parse(params);

  if (client.room !== undefined) {
      __broadcast(client, 'left', JSON.stringify({ id: client.id }));
      client.leave(client.room);
  }

  var members = {};

  Object.keys(clients)
    .filter((k) => (clients[k].room === id))
    .forEach((k)=> { members[k] = { id: k } });

  client.room = id;

  client.join(client.room, (err) => {
    __broadcast(client, 'joined', JSON.stringify({ id: client.id }));
    __emit(client, 'members', JSON.stringify(members));
  });
};

const onClientLeave = (client, params) => {
  if (client.room !== undefined) {
    __broadcast(client, 'left', JSON.stringify({ id: client.id }));
    client.leave(client.room);
  }

  delete client.room;
};

const onClientWebRTC = (client, params) => {
  const { receiver } = JSON.parse(params);

  if (receiver !== undefined && clients[receiver] !== undefined) {
    __emit(clients[receiver], 'webrtc', params);
  }
  else {
    __broadcast(client, 'webrtc', params);
  }
};

const onClientMessage = (client, params) => {
  const { receiver } = JSON.parse(params);

  if (receiver !== undefined && clients[receiver] !== undefined) {
    __emit(clients[receiver], 'message', params);
  }
  else {
    __broadcast(client, 'message', params);
  }
};

const onClientToggleAudio = (client, params) => {
  const { receiver } = JSON.parse(params);

  if (receiver !== undefined && clients[receiver] !== undefined) {
    __emit(clients[receiver], 'toggle-audio', params);
  }
  else {
    __broadcast(client, 'toggle-audio', params);
  }
};

const onClientToggleVideo = (client, params) => {
  const { receiver } = JSON.parse(params);

  if (receiver !== undefined && clients[receiver] !== undefined) {
    __emit(clients[receiver], 'toggle-video', params);
  }
  else {
    __broadcast(client, 'toggle-video', params);
  }
};

const onClientDisconnecting = (client, params) => {
  if (client.room !== undefined) {
    __broadcast(client, 'left', JSON.stringify({ id: client.id }));
    client.leave(client.room);
  }
};

const onClientDisconnect = (client, params) => {
  delete clients[client.id];
};

module.exports = {
  init: initSocketIo
};
