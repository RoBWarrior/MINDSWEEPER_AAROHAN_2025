require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./api/auth.js");
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

const arithRoutes = require('./api/game2');
app.use('/api', arithRoutes);

const pointRoutes = require("./api/points.js");
app.use("/api",pointRoutes);

const leaderBoardRoutes = require('./api/leaderBoard.js');
app.use("/api",leaderBoardRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));