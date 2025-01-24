const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  email: String,
  msg: [
    {
      userMessage: { type: String, required: true },
      botReply: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model('ChatBot', ChatSchema);