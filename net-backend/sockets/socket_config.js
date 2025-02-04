const { Server } = require("socket.io");
const User = require("../models/user");
const Message = require("../models/message");

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*", // Allow all origins (update for production)
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", async (socket) => {
    console.log("User connected:", socket.id);

    // Handle pairing logic
    const waitingUser = await User.findOne({ pairedWith: null });
    if (waitingUser) {
      await User.findByIdAndUpdate(waitingUser._id, { pairedWith: socket.id });
      await User.create({ socketId: socket.id, pairedWith: waitingUser.socketId });

      io.to(waitingUser.socketId).emit("matched", { peerId: socket.id });
      io.to(socket.id).emit("matched", { peerId: waitingUser.socketId });
    } else {
      await User.create({ socketId: socket.id });
    }

    // WebRTC signaling
    socket.on("offer", (data) => io.to(data.peerId).emit("offer", { sdp: data.sdp, sender: socket.id }));
    socket.on("answer", (data) => io.to(data.peerId).emit("answer", { sdp: data.sdp, sender: socket.id }));
    socket.on("ice-candidate", (data) => io.to(data.peerId).emit("ice-candidate", { candidate: data.candidate }));

    // Handle disconnection
    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);

      const user = await User.findOne({ socketId: socket.id });
      if (user) {
        if (user.pairedWith) {
          io.to(user.pairedWith).emit("user-disconnected");
          await User.findOneAndUpdate({ socketId: user.pairedWith }, { pairedWith: null });

          // Try to find a new pair
          findNewPair({ id: user.pairedWith }, io);
        }
        await User.deleteOne({ socketId: socket.id });
      }
    });

    // Handle messages
    socket.on("message", async (data) => {
      try {
        if (!data.messageData || typeof data.messageData !== "string" || data.messageData.trim() === "") {
          console.warn("Received message without content. Ignoring.");
          console.log("Received message:", data);
          return;
        }

        const message = new Message({
          reciverSocketId: data.reciver,
          senderSocketId: socket.id,
          date: new Date(),
          content: data.messageData,
        });

        await message.save();
        io.to(data.reciver).emit("message", data);

        console.log("Message stored:", data);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });
  });
}

async function findNewPair(socket, io) {
  const waitingUser = await User.findOne({ pairedWith: null, socketId: { $ne: socket.id } });

  if (waitingUser) {
    await User.findByIdAndUpdate(waitingUser._id, { pairedWith: socket.id });
    await User.findOneAndUpdate({ socketId: socket.id }, { pairedWith: waitingUser.socketId });

    io.to(waitingUser.socketId).emit("matched", { peerId: socket.id });
    io.to(socket.id).emit("matched", { peerId: waitingUser.socketId });

    console.log(`User ${socket.id} paired with ${waitingUser.socketId}`);
  } else {
    await User.findOneAndUpdate({ socketId: socket.id }, { pairedWith: null });
    console.log(`User ${socket.id} is waiting for a new partner.`);
  }
}

module.exports = setupSocket;
