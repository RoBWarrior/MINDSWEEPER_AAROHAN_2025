import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "./dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleGameClick = (path) => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  return (
      <div className="dashboard h-screen bg-black-900 text-white flex flex-col">
      {/* <div className="typewriter mt-4 text-2xl">
        <h1>Get Ready To Challenge Your Mind</h1>
      </div> */}

      <div className="flex items-center justify-center flex-grow gap-8">
        <button
          onClick={() => handleGameClick("/game1")}
          style={{
            backgroundImage: "url('../../../public/assets/360_F_461470323_6TMQSkCCs9XQoTtyer8VCsFypxwRiDGU.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="w-64 h-75 flex items-center justify-center text-2xl font-bold text-white bg-green-500 rounded-2xl shadow-xl uppercase transform transition-all duration-300 hover:scale-110 hover:bg-green-700 border bg-white"
        >
          Game 1
        </button>
        <button
          onClick={() => handleGameClick("/game2")}
          style={{
            backgroundImage: "url('../../../public/assets/wet-asphalt-rain-reflection-neon-lights-puddles-night-city-abstract-dark-background-light-rays-bokeh-128212671.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="w-64 h-75 flex items-center justify-center bg-red-500 rounded-2xl shadow-lg text-white font-bold text-2xl uppercase tracking-wider transition-all transform hover:scale-110 hover:bg-red-700 border bg-white"
        >
          Game 2
        </button>
      </div>
    </div>
  );
};

export default Dashboard;