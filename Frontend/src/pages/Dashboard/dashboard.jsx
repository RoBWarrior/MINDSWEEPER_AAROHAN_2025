import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "./dashboard.css";

const games = [
  {
    id: "game1",
    title: "GAME 1",
    path: "/game1",
    image: "/assets/360_F_461470323_6TMQSkCCs9XQoTtyer8VCsFypxwRiDGU.jpg",
  },
  {
    id: "game2",
    title: "GAME 2",
    path: "/game2",
    image:
      "/assets/wet-asphalt-rain-reflection-neon-lights-puddles-night-city-abstract-dark-background-light-rays-bokeh-128212671.webp",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  const handlePlay = (path) => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  return (
    <div className="dashboard min-h-screen bg-futuristic text-white">
      {/* Background layers */}
      <div className="bg-layers" aria-hidden="true"></div>
      <div className="particles" aria-hidden="true">
        <span className="p1" />
        <span className="p2" />
        <span className="p3" />
        <span className="p4" />
        <span className="p5" />
      </div>

      <main className="container mx-auto px-6 py-12 flex flex-col items-center  mt-16">
        
        <h1 className="mb-20 text-3xl md:text-4xl font-extrabold tracking-wide neon-title text-center">
          Choose Your Challenge
        </h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 justify-items-center mx-auto w-full max-w-5xl">

          {games.map((g) => (
            <article
              key={g.id}
              className="card group relative 
                         w-90 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg
                         h-56 sm:h-64 md:h-80 lg:h-96 
                         rounded-2xl overflow-hidden border border-white/10 shadow-2xl mx-auto transition-transform duration-300 hover:scale-[1.02] "
              style={{
                backgroundImage: `url(${g.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* dark glass overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/35 to-transparent transition-opacity group-hover:from-black/45" />

              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6">
                <div className="title text-lg sm:text-lg md:text-lg tracking-widest font-semibold mb-3 text-white/90 uppercase drop-shadow-lg text-center">
                  {g.title}
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlay(g.path);
                    }}
                    aria-label={`Play ${g.title}`}
                    className="play-btn relative z-20 flex items-center justify-center 
                               w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 
                               rounded-full backdrop-blur-sm border border-white/20 shadow-lg 
                               transform transition-all duration-300 group-hover:scale-110"
                  >
                    Play
                  </button>
                </div>
              </div>

              {/* bottom shimmer */}
              <div className="shimmer absolute bottom-0 left-0 w-full h-12 z-5 pointer-events-none" />
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
