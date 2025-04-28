import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { Server } from "socket.io"; // <-- Import socket.io
import http from "http"; // <-- Import native Node.js http module

import router from "./routes/Router.js";
import { setupSocketIO } from "./config/Socket.js"; // <-- Import socket setup (new file)

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "https://shikhbo-frontend.onrender.com", "https://appshikhbo.netlify.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],

  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Routes
app.use("/api", router);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "Something went wrong!", error: err.message });
});

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin:  "http://localhost:5173",
    credentials: true,
  }
});

// Setup Socket Events
setupSocketIO(io);

// Start server
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, io };
