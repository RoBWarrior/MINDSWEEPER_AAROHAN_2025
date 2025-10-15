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
        <br />
        <h1 className="mb-20 text-3xl md:text-4xl font-extrabold tracking-wide neon-title text-center">
          Choose Your Challenge
        </h1>
        <br />
        <br />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 justify-items-center mx-auto w-full max-w-5xl">
{games.map((g) => (
  <div
    key={g.id}
    className="glow-border-wrapper rounded-2xl mx-auto w-90 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg
               h-56 sm:h-64 md:h-80 lg:h-96 transition-transform duration-300 hover:scale-[1.03]"
  >
    <article
      className="card-inner relative rounded-[14px] overflow-hidden border border-white/10 shadow-2xl h-full"
      style={{
        backgroundImage: `url(${g.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onClick={() => handlePlay(g.path)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") handlePlay(g.path); }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent z-10" />

      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6">
        <div className="title text-lg sm:text-lg md:text-xl tracking-widest font-semibold mb-3 text-white/90 uppercase drop-shadow-lg text-center">
          {g.title}
        </div>



       <div className="flex items-center gap-4"> 
        <button onClick={(e) => { e.stopPropagation(); handlePlay(g.path); }} aria-label={`Play ${g.title}`}
         className="play-btn relative z-20 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full backdrop-blur-sm border border-white/20 shadow-lg transform transition-all duration-300 group-hover:scale-110 cursor-pointer" >
           Play </button> </div>
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
