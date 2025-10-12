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
      <div className="dashboard h-screen bg-gray-900 text-white flex flex-col">
      <div className="typewriter mt-4 text-2xl">
        <h1>Get Ready To Challenge Your Mind</h1>
      </div>

      <div className="flex flex-col items-center justify-center flex-grow gap-8">
        <button
          onClick={() => handleGameClick("/game1")}
          className="w-64 h-24 flex items-center justify-center text-2xl font-bold text-white bg-blue-500 rounded-2xl shadow-xl uppercase transform transition-all duration-300 hover:scale-110 hover:bg-blue-700"
        >
          Game 1
        </button>
        <button
          onClick={() => handleGameClick("/game2choose")}
          className="w-64 h-24 flex items-center justify-center bg-red-500 rounded-2xl shadow-lg text-white font-bold text-2xl uppercase tracking-wider transition-all transform hover:scale-110 hover:bg-red-700"
        >
          Game 2
        </button>
      </div>
    </div>
  );
};

export default Dashboard;