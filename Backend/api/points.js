const express = require("express");
const router = express.Router();
const CryptoJS = require("crypto-js");
const User = require("../models/User");
const Game = require("../models/Game"); // Assuming a Game model exists

// Secret key used for encryption/decryption
const secretKey = 'Z8yd9sfG9h1r3f9$jb0vXp!92mbR6hFz';

// POST API to update user points
router.post("/update-points", async (req, res) => {
  try {
    const { encryptedGameId, email_id, points } = req.body;

    // Validate request data
    if (!encryptedGameId || !email_id || typeof points !== "number") {
      return res.status(400).json({ error: "Invalid game ID, email, or points" });
    }

    // Decrypt the encryptedGameId
    const bytes = CryptoJS.AES.decrypt(encryptedGameId, secretKey);
    const decryptedGameId = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedGameId) {
      return res.status(400).json({ error: "Decryption failed" });
    }

    // Verify if the game ID exists in the database
    const game = await Game.findById(decryptedGameId);
    if (!game) {
      return res.status(404).json({ error: "Game ID not found" });
    }

    // Find the user and update points
    const user = await User.findOneAndUpdate(
      { email: email_id }, // Find user by email
      { $inc: { points: points } }, // Increment points
      { new: true } // Return updated document
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete the game entry from the database
    await Game.findByIdAndDelete(decryptedGameId);

    res.json({
      message: "Points updated successfully, game deleted",
      user,
      decryptedGameId,
    });
  } catch (error) {
    console.error("Error updating points:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;