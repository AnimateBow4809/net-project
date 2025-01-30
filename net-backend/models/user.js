const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    socketId: { type: String, required: true },
    pairedWith: { type: String, default: null }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
