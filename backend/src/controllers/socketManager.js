import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const initializeServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("join-call", (path) => {
      if (!connections[path]) {
        connections[path] = [];
      }

      if (!connections[path].includes(socket.id)) {
        connections[path].push(socket.id);
      }
      timeOnline[socket.id] = new Date();

      io.to(path).emit("user-joined", socket.id, connections[path]);

      // Send existing messages to the new client
      if (messages[path]) {
        messages[path].forEach((message) => {
          io.to(socket.id).emit(
            "chat-message",
            message.data,
            message.sender,
            message["socket-id-sender"]
          );
        });
      }
    });

    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (data, sender) => {
      const path = Object.keys(connections).find((room) =>
        connections[room].includes(socket.id)
      );
      if (path) {
        if (!messages[path]) {
          messages[path] = [];
        }

        const message = {
          sender,
          data,
          "socket-id-sender": socket.id,
        };
        messages[path].push(message);

        connections[path].forEach((clientId) => {
          io.to(clientId).emit("chat-message", data, sender, socket.id);
        });
      }
    });

    socket.on("disconnect", () => {
      const diffTime = Math.abs(new Date() - timeOnline[socket.id]);

      let path;
      for (const [room, clients] of Object.entries(connections)) {
        if (clients.includes(socket.id)) {
          path = room;
          break;
        }
      }

      if (path) {
        connections[path] = connections[path].filter((id) => id !== socket.id);
        io.to(path).emit("user-left", socket.id);

        if (connections[path].length === 0) {
          delete connections[path];
          delete messages[path];
        }
      }

      delete timeOnline[socket.id];
    });
  });

  return io;
};
