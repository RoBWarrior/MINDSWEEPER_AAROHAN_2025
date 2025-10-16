// import React, { useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import styles from "./Auth.module.css";
// import { AuthContext } from "../../AuthContext";

// const AuthForm = () => {
//   const [isSignUp, setIsSignUp] = useState(false);
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const { login } = useContext(AuthContext);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (isSignUp && password !== confirmPassword) {
//       setError("Passwords do not match!");
//       return;
//     }

//     const endpoint = isSignUp
//       ? `${import.meta.env.VITE_BACKEND_BASE}/api/auth/signup`
//       : `${import.meta.env.VITE_BACKEND_BASE}/api/auth/login`;

//     setIsLoading(true);

//     try {
//       const response = await fetch(endpoint, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(
//           isSignUp ? { username, email, password } : { email, password }
//         ),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         login({ token: data.token, email: email });
//         navigate("/");
//       } else {
//         console.error("Authentication failed:", data.message);
//         setError(data.message || "Authentication failed");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       setError("Network error. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const inputVariants = {
//     hidden: { opacity: 0, x: -20 },
//     visible: (i) => ({
//       opacity: 1,
//       x: 0,
//       transition: {
//         delay: i * 0.1,
//         duration: 0.4,
//         ease: "easeOut",
//       },
//     }),
//   };

//   return (
//     <div className={styles.pageWrapper}>
//       {/* Animated Background */}
//       <div className={styles.background}>
//         <div className={styles.shape}></div>
//         <div className={styles.shape}></div>
//       </div>

//       {/* Auth Box */}
//       <motion.div
//         className={styles.authBox}
//         initial={{ opacity: 0, scale: 0.9, y: 20 }}
//         animate={{ opacity: 1, scale: 1, y: 0 }}
//         transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
//       >
//         {/* Title with Icon */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2, duration: 0.5 }}
//         >
//           <div className={styles.titleWrapper}>
//             <motion.div
//               className={styles.titleIcon}
//               animate={{
//                 rotate: [0, 5, -5, 0],
//                 scale: [1, 1.1, 1],
//               }}
//               transition={{
//                 duration: 3,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               }}
//             >
//               {isSignUp ? "🚀" : "🔐"}
//             </motion.div>
//             <h2 className={styles.authTitle}>
//               {isSignUp ? "Create Account" : "Welcome Back"}
//             </h2>
//           </div>
//           <p className={styles.subtitle}>
//             {isSignUp
//               ? "Join the adventure and start your journey"
//               : "Enter your credentials to continue"}
//           </p>
//         </motion.div>

//         {/* Error Message */}
//         <AnimatePresence mode="wait">
//           {error && (
//             <motion.div
//               className={styles.errorMessage}
//               initial={{ opacity: 0, y: -10, scale: 0.9 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               exit={{ opacity: 0, y: -10, scale: 0.9 }}
//               transition={{ duration: 0.3 }}
//             >
//               <svg
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 className={styles.errorIcon}
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                 />
//               </svg>
//               <span>{error}</span>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Form */}
//         <form onSubmit={handleSubmit}>
//           <AnimatePresence mode="wait">
//             {/* Username Field (Sign Up Only) */}
//             {isSignUp && (
//               <motion.div
//                 className={styles.inputContainer}
//                 custom={0}
//                 variants={inputVariants}
//                 initial="hidden"
//                 animate="visible"
//                 exit={{ opacity: 0, x: -20 }}
//                 key="username"
//               >
//                 <span className={styles.inputIcon}>👤</span>
//                 <input
//                   type="text"
//                   name="username"
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   placeholder="Username"
//                   required
//                   disabled={isLoading}
//                 />
//               </motion.div>
//             )}

//             {/* Email Field */}
//             <motion.div
//               className={styles.inputContainer}
//               custom={isSignUp ? 1 : 0}
//               variants={inputVariants}
//               initial="hidden"
//               animate="visible"
//               key="email"
//             >
//               <span className={styles.inputIcon}>📧</span>
//               <input
//                 type="email"
//                 name="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="Email Address"
//                 required
//                 disabled={isLoading}
//               />
//             </motion.div>

//             {/* Password Field */}
//             <motion.div
//               className={styles.inputContainer}
//               custom={isSignUp ? 2 : 1}
//               variants={inputVariants}
//               initial="hidden"
//               animate="visible"
//               key="password"
//             >
//               <span className={styles.inputIcon}>🔒</span>
//               <input
//                 type="password"
//                 name="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Password"
//                 required
//                 disabled={isLoading}
//               />
//             </motion.div>

//             {/* Confirm Password Field (Sign Up Only) */}
//             {isSignUp && (
//               <motion.div
//                 className={styles.inputContainer}
//                 custom={3}
//                 variants={inputVariants}
//                 initial="hidden"
//                 animate="visible"
//                 exit={{ opacity: 0, x: -20 }}
//                 key="confirmPassword"
//               >
//                 <span className={styles.inputIcon}>🔒</span>
//                 <input
//                   type="password"
//                   name="confirmPassword"
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   placeholder="Confirm Password"
//                   required
//                   disabled={isLoading}
//                 />
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* Submit Button */}
//           <motion.button
//             className={styles.authButton}
//             whileHover={{ scale: isLoading ? 1 : 1.02 }}
//             whileTap={{ scale: isLoading ? 1 : 0.98 }}
//             type="submit"
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <motion.div
//                 className={styles.loadingSpinner}
//                 animate={{ rotate: 360 }}
//                 transition={{
//                   duration: 1,
//                   repeat: Infinity,
//                   ease: "linear",
//                 }}
//               >
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2.5}
//                     d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
//                   />
//                 </svg>
//               </motion.div>
//             ) : (
//               <>
//                 <span>{isSignUp ? "Create Account" : "Sign In"}</span>
//                 <svg
//                   className={styles.buttonArrow}
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M13 7l5 5m0 0l-5 5m5-5H6"
//                   />
//                 </svg>
//               </>
//             )}
//           </motion.button>
//         </form>

//         {/* Footer */}
//         <div className={styles.authFooter}>
//           <span className={styles.footerText}>
//             {isSignUp ? "Already have an account?" : "Don't have an account?"}
//           </span>
//           <motion.button
//             onClick={() => {
//               setIsSignUp(!isSignUp);
//               setError("");
//               setUsername("");
//               setEmail("");
//               setPassword("");
//               setConfirmPassword("");
//             }}
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             disabled={isLoading}
//           >
//             {isSignUp ? "Sign In" : "Sign Up"}
//             <svg
//               className={styles.footerArrow}
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M17 8l4 4m0 0l-4 4m4-4H3"
//               />
//             </svg>
//           </motion.button>
//         </div>

//         {/* Decorative Elements */}
//         <div className={styles.decorativeDots}>
//           {[...Array(3)].map((_, i) => (
//             <motion.div
//               key={i}
//               className={styles.dot}
//               animate={{
//                 scale: [1, 1.5, 1],
//                 opacity: [0.3, 0.6, 0.3],
//               }}
//               transition={{
//                 duration: 2,
//                 repeat: Infinity,
//                 delay: i * 0.3,
//               }}
//             />
//           ))}
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default AuthForm;





import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Auth.module.css";
import { AuthContext } from "../../AuthContext";

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);

  const validatePhone = (p) => {
    const cleaned = String(p).replace(/[^+\d]/g, "");
    return /^\+?\d{7,15}$/.test(cleaned);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError("Passwords do not match!");
        return;
      }
      if (!validatePhone(phone)) {
        setError("Enter a valid phone number (digits, optional leading +).");
        return;
      }
    }

    const endpoint = isSignUp
      ? `${import.meta.env.VITE_BACKEND_BASE}/api/auth/signup`
      : `${import.meta.env.VITE_BACKEND_BASE}/api/auth/login`;

    setIsLoading(true);

    try {
      const body = isSignUp
        ? { username, email, password, phone }
        : { email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        if (isSignUp) {
          // If backend returns token on signup use it; otherwise try login.
          if (data.token) {
            login({ token: data.token, email });
            navigate("/");
          } else {
            const loginResp = await fetch(`${import.meta.env.VITE_BACKEND_BASE}/api/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            });
            const loginData = await loginResp.json();
            if (loginResp.ok) {
              login({ token: loginData.token, email });
              navigate("/");
            } else {
              setError("Signed up. Please sign in.");
              setIsSignUp(false);
            }
          }
        } else {
          login({ token: data.token, email });
          navigate("/");
        }
      } else {
        setError(data.message || data.error || "Authentication failed");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.08,
        duration: 0.4,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.background}>
        <div className={styles.shape}></div>
        <div className={styles.shape}></div>
      </div>

      <motion.div
        className={styles.authBox}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {/* DIRECT CONTENT: external page scroll will handle overflow */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className={styles.titleWrapper}>
            <motion.div
              className={styles.titleIcon}
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {isSignUp ? "🚀" : "🔐"}
            </motion.div>
            <h2 className={styles.authTitle}>
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
          </div>
          <p className={styles.subtitle}>
            {isSignUp
              ? "Join the adventure and start your journey"
              : "Enter your credentials to continue"}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              className={styles.errorMessage}
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className={styles.errorIcon}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {isSignUp && (
              <motion.div
                className={styles.inputContainer}
                custom={0}
                variants={inputVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -20 }}
                key="username"
              >
                <span className={styles.inputIcon}>👤</span>
                <input
                  type="text"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  required
                  disabled={isLoading}
                />
              </motion.div>
            )}

            {isSignUp && (
              <motion.div
                className={styles.inputContainer}
                custom={1}
                variants={inputVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -20 }}
                key="phone"
              >
                <span className={styles.inputIcon}>📱</span>
                <input
                  type="tel"
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone (e.g. +911234567890)"
                  required
                  disabled={isLoading}
                />
              </motion.div>
            )}

            <motion.div
              className={styles.inputContainer}
              custom={isSignUp ? 2 : 0}
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              key="email"
            >
              <span className={styles.inputIcon}>📧</span>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                disabled={isLoading}
              />
            </motion.div>

            <motion.div
              className={styles.inputContainer}
              custom={isSignUp ? 3 : 1}
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              key="password"
            >
              <span className={styles.inputIcon}>🔒</span>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                disabled={isLoading}
              />
            </motion.div>

            {isSignUp && (
              <motion.div
                className={styles.inputContainer}
                custom={4}
                variants={inputVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -20 }}
                key="confirmPassword"
              >
                <span className={styles.inputIcon}>🔒</span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  required
                  disabled={isLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            className={styles.authButton}
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <motion.div
                className={styles.loadingSpinner}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </motion.div>
            ) : (
              <>
                <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                <svg
                  className={styles.buttonArrow}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </>
            )}
          </motion.button>
        </form>

        <div className={styles.authFooter}>
          <span className={styles.footerText}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
          </span>
          <motion.button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setUsername("");
              setPhone("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
            <svg
              className={styles.footerArrow}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </motion.button>
        </div>

        <div className={styles.decorativeDots}>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className={styles.dot}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthForm;
