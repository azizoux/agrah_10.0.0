import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import prisma from "./lib/client.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);
  const onlineParties = [];
  let onlineUsers = [];
  io.on("connection", (socket) => {
    socket.on("addNewUser", (data) => {
      const existingUser = onlineUsers.find((user) => user.username === data);
      if (existingUser) {
        existingUser.socketId = socket.id;
      } else {
        onlineUsers.push({
          username: data,
          socketId: socket.id,
        });
      }
      io.emit("getUsers", onlineUsers);
      console.log("✅ Socket connecté :", socket.id);
      console.log("✅ Users connected :", onlineUsers);
    });
    socket.on("disconnect", () => {
      onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
      //   send active users
      io.emit("getUsers", onlineUsers);
    });
    socket.on("sendParty", (data) => {
      console.log("userTourId", data.tourId);
      io.emit("getParty", data);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error("❌ Erreur serveur:", err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`🚀 Serveur prêt : http://${hostname}:${port}`);
    });
});
