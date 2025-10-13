require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./api/auth.js");

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));


app.get("/", (req, res) => {
  res.send("API is working!");
});
  
app.use("/api/auth", authRoutes);

const gameRoutes = require("./api/game");
app.use("/api", gameRoutes);

const pointRoutes = require("./api/points.js");
app.use("/api",pointRoutes);

const leaderBoardRoutes = require('./api/leaderBoard.js');
app.use("/api",leaderBoardRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));