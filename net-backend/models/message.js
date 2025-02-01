const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    reciverSocketId: { type: String, required: true },
    senderSocketId: { type: String,required: true  },
    date:{type:Date,required:true},
    content:{type:String,required:true}
},{strict:true});

const message = mongoose.model('message', messageSchema);

module.exports = message;
