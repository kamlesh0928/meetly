import express from "express";
import dotenv from "dotenv";
import { createServer } from "node:http";
import mongoose, { Mongoose } from "mongoose";
import cors from "cors";

import { initializeServer } from "./controllers/socketManager.js";

dotenv.config();

const app = express();
const server = createServer(app);

// Initialize Socket.IO with the server
const io = initializeServer(server);

// Middleware
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ extended: true, limit: "40kb" }));

// Set default port
const PORT = process.env.PORT || 8000;
app.set("port", PORT);

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
