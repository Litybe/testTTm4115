const mongoose = require('mongoose');
const { Schema } = mongoose;

const lockSchema = new Schema({
  name: String,
  ownerId: String,
  lockSecret: String,
});

mongoose.model('locks', lockSchema);
