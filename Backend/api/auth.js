// const express = require("express");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User.js");

// const router = express.Router();

// // SIGNUP Route
// router.post("/signup", async (req, res) => {
//   const { username, email, password } = req.body;

//   try {
//     let user = await User.findOne({ email });

//     if (user) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     user = new User({ username, email, password: hashedPassword });
//     await user.save();

//     res.status(201).json({ message: "User registered successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // LOGIN Route
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const payload = { userId: user.id };
//     const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

//     res.json({ token });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// module.exports = router;





const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");

const router = express.Router();

// SIGNUP Route
router.post("/signup", async (req, res) => {
  try {
    let { username, email, password, phone } = req.body;

    // basic validation
    if (!username || !email || !password || !phone) {
      return res.status(400).json({ message: "Please provide username, email, password and phone" });
    }

    // normalize phone (remove spaces, dashes, parentheses)
    phone = String(phone).replace(/[^+\d]/g, '');

    // check duplicates by email or phone
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      if (existing.email === email) {
        return res.status(400).json({ message: "Email already registered" });
      }
      if (existing.phone === phone) {
        return res.status(400).json({ message: "Phone number already registered" });
      }
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ username, email, password: hashedPassword, phone });
    await user.save();

    // Option A: return success message only
    // res.status(201).json({ message: "User registered successfully" });

    // Option B: auto-login by issuing token on signup (convenient for UX)
    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error("Signup error:", error);
    // handle duplicate key error gracefully (in case index exists)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "field";
      return res.status(400).json({ message: `${field} already exists` });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
