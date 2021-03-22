const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botName = "ChatCord Bot";

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    const type = 'public';

    socket.join(user.room);

    // Welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to ChatCord!!", type));

    
    // Broadcast when user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`, type)
      );


    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });


    // Run when clients disconnects
    socket.on("disconnect", () => {
      const user = userLeave(socket.id);
      const type = 'public';

      if (user) {
        io.to(user.room).emit(
          "message",
          formatMessage(botName, `${user.username} has left the chat`, type)
        );
        io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: getRoomUsers(user.room),
        });
      }
    });
  });

  // Listen for chat messages
  socket.on("chatMessage", ({msg, type }) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg, type));
  });

  socket.on("privateChatMessage", ({ receiverId, msg, type, sender }) => {
    const user = getCurrentUser(socket.id);
    const receiverName = getCurrentUser(receiverId).username
    io.to(receiverId).emit("message", formatMessage(user.username, msg, type));
    io.to(sender).emit("message", formatMessage(user.username, msg, type, sender, receiverName));
  });
  
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
