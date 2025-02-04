const mongoose = require("mongoose");

function connectDB() {
  mongoose.connect("mongodb://mongo/webrtc", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
}

module.exports = { connectDB };
