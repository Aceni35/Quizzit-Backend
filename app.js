const express = require("express");
const mongoose = require("mongoose");
require("express-async-errors");
require("dotenv").config();
const cors = require("cors");

//middleware
const NotFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const checkAuth = require("./middleware/authentication");

const app = express();

const socket = require("socket.io");
const io = socket(3000, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

app.use(cors());
app.use(express.json());

//Routers
const authRouter = require("./routers/auth");
const postRouter = require("./routers/post");
const userRouter = require("./routers/users");
const playRouter = require("./routers/play");
const settingsRouter = require("./routers/settings");
const { playSocket } = require("./controllers/play");

app.use("/api", authRouter);
app.use("/api", checkAuth, postRouter);
app.use("/api", checkAuth, playRouter);
app.use("/api", checkAuth, userRouter);
app.use("/api", checkAuth, settingsRouter);

app.use(NotFound);
app.use(errorHandler);

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    app.listen(5000, () => {
      console.log("listening...");
    });
  } catch (error) {
    console.log(error);
  }
};
connect();

io.on("connection", (socket) => {
  const id = socket.handshake.query.id;
  socket.join(id);
  console.log(`${id} has connected`);
  playSocket(socket, id);
});
