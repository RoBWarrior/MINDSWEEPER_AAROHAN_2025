import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./Auth.module.css";
import { AuthContext } from "../../AuthContext"; 

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const { login } = useContext(AuthContext); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignUp && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const endpoint = isSignUp
      ? "https://mindsweeper-api.onrender.com/api/auth/signup"
      : "https://mindsweeper-api.onrender.com/api/auth/login";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isSignUp ? { username, email, password } : { email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login({token: data.token, email: email});
        navigate("/");
      } else {
        console.error("Authentication failed:", data.message);
        alert(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.background}>
        <div className={styles.shape}></div>
        <div className={styles.shape}></div>
      </div>
      <motion.div
        className={styles.authBox}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className={styles.authTitle}>{isSignUp ? "Sign Up" : "Login"}</h2>
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div className={styles.inputContainer}>
              <span>👤</span>
              <input
                type="text"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
              />
            </div>
          )}
          <div className={styles.inputContainer}>
            <span>📧</span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>
          <div className={styles.inputContainer}>
            <span>🔒</span>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>
          {isSignUp && (
            <div className={styles.inputContainer}>
              <span>🔒</span>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
              />
            </div>
          )}
          <motion.button whileHover={{ scale: 1.05 }} className={styles.authButton}>
            {isSignUp ? "Sign Up" : "Login"}
          </motion.button>
        </form>
        <div className={styles.authFooter}>
          <button onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Login Instead" : "Sign Up Instead"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthForm;