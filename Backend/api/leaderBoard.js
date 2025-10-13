const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Assuming your User model is in the models folder

// Endpoint to get the leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    // Fetch the users, sorted by points in descending order
    const leaderboard = await User.find()
      .sort({ points: -1 })  // Sort by points in descending order

    // Send the leaderboard as the response
    res.status(200).json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the leaderboard.',
    });
  }
});

module.exports = router;