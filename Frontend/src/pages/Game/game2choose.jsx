import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import React from "react";

export default function Game2choose() {
  const navigate = useNavigate();

  const levels = [
    { name: "Easy", color: "bg-green-500", route: "/game2/3" },
    { name: "Medium", color: "bg-yellow-500", route: "/game2/5" },
    { name: "Hard", color: "bg-red-500", route: "/game2/7" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-800 to-black text-white px-4 sm:px-8 py-10">
      

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-8 sm:mb-12 text-center">
        Choose Your Level
      </h1>

      <div className="flex flex-wrap gap-5 sm:gap-8 justify-center w-full max-w-3xl cursor-pointer">
        {levels.map((level, index) => (
          <motion.button
            key={index}
            className={`w-full sm:w-60 ${level.color} text-white px-8 py-4 text-lg sm:text-xl font-semibold rounded-xl shadow-xl hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all duration-300`}
            onClick={() => navigate(level.route)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {level.name}
          </motion.button>
        ))}
      </div>
    </div>
  );
}