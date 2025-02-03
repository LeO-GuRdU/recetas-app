const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  avatarUrl: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
