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
    }
  });

  io.on("connection", (socket) => {
    socket.on("join", (path) => {
      if (connections[path] === undefined) {
        connections[path] = [];
      }

      connections[path].push(socket.id);
      timeOnline[socket.id] = new Date();

      for (let a = 0; a < connections[path].length; a++) {
        io.to(connections[path][a]).emit("join", socket.id, connections[path]);
      }

      if (messages[path] !== undefined) {
        for (let message of messages[path]) {
          io.to(socket.id).emit(
            "chat",
            message[path][a]["data"],
            messages[path][a]["sender"],
            messages[path][a]["socket-id-sender"]
          );
        }
      }
    });

    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat", (data, sender) => {
      const [matchingRoom, foundRoom] = Object.entries(connections).reduce(
        ([room, isFound], [roomKey, roomValue]) => {
          if (!isFound && roomValue.includes(socket.id)) {
            return [roomKey, true];
          }

          return [room, isFound];
        },
        ["", false]
      );

      if (foundRoom) {
        if (messages[matchingRoom] === undefined) {
          messages[matchingRoom] = [];
        }

        messages[matchingRoom].push({
          sender: sender,
          data: data,
          "socket-id-sender": socket.id,
        });

        console.log(`Message from ${sender} in room ${matchingRoom}: ${data}`);

        connections[matchingRoom].forEach((element) => {
          io.to(element).emit("chat", data, sender, socket.id);
        });
      }
    });

    socket.on("disconnect", () => {
      var diffTime = Math.abs(new Date() - timeOnline[socket.id]);

      var key;

      for (const [k, v] of JSON.parse(
        JSON.stringify(Object.entries(connections))
      )) {
        for (let a = 0; a < v.length; a++) {
          if (v[a] === socket.id) {
            key = k;

            for (let b = 0; b < connections[key].length; b++) {
              io.to(connections[key][b]).emit("leave", socket.id);
            }

            var index = connections[key].indexOf(socket.id);
            connections[key].splice(index, 1);

            if (connections[key].length === 0) {
              delete connections[key];
            }
          }
        }
      }
    });
  });

  return io;
};
