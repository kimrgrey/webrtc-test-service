const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  id: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },
});

RoomSchema.statics = {
  get(id) {
    return this.findOne({ id }).exec().then((room) => (room));
  },
};

module.exports = mongoose.model('Room', RoomSchema);
