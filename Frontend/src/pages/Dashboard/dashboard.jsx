import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "./dashboard.css";

const games = [
  {
    id: "game1",
    title: "GAME 1",
    path: "/game1",
    image: "/assets/game1bg.png",
  },
  {
    id: "game2",
    title: "GAME 2",
    path: "/game2",
    image: "/assets/game2bg.png",
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
    <div className="dashboard min-h-screen bg-futuristic text-white flex flex-col items-center justify-center">
      {/* Background layers */}
      <div className="bg-layers" aria-hidden="true"></div>
      <div className="particles" aria-hidden="true">
        <span className="p1" />
        <span className="p2" />
        <span className="p3" />
        <span className="p4" />
        <span className="p5" />
      </div>

      <main className="w-full flex flex-col items-center justify-center px-6 py-6">
        <h1 className="mb-16 text-3xl md:text-5xl font-extrabold tracking-wide neon-title text-center">
          Choose Your Challenge
        </h1>

        <br />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center mx-auto w-full max-w-5xl px-4">
  {games.map((g) => (
    <div
      key={g.id}
      className="rounded-2xl w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-64 sm:h-72 md:h-80 lg:h-96 transition-transform duration-300 hover:scale-105"
    >
      <article
        className="relative rounded-[14px] overflow-hidden border border-white/10 shadow-2xl h-full cursor-pointer"
        style={{
          backgroundImage: `url(${g.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        onClick={() => handlePlay(g.path)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") handlePlay(g.path);
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent z-10" />

        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6">
          <div className="text-lg sm:text-xl md:text-2xl tracking-widest font-semibold mb-3 text-white/90 uppercase text-center">
            {g.title}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePlay(g.path);
            }}
            aria-label={`Play ${g.title}`}
            className="relative z-20 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full backdrop-blur-sm border border-white/30 shadow-lg transition-all duration-300 hover:scale-110"
          >
            Play
          </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-20" />
      </article>
    </div>
  ))}
</div>

      </main>
    </div>
  );
};

export default Dashboard;
