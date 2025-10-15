// // import { useNavigate } from "react-router-dom";
// // import React, { useEffect, useState } from "react";
// // import "./dashboard.css";

// // const games = [
// //   {
// //     id: "game1",
// //     title: "GAME 1",
// //     path: "/game1",
// //     image: "/assets/game1bg.png",
// //     rules: [
// //       "The game consists of a 3x3 grid filled with 0,1,2.",
// //       "Each click on a cell increments its value and its adjacent cell's values by 1 modulo 3.",
// //       "You will be rewarded 75 points if you can make all cells 0 in the grid.",
// //     ],
// //   },
// //   {
// //     id: "game2",
// //     title: "GAME 2",
// //     path: "/game2",
// //     image: "/assets/game2bg.png",
// //     rules: [
// //       "You are given a tree with 7 nodes and values 1,3,5,7,9,11,13.",
// //       "The weight of the edge is calculated as the absolute difference of the values of the two nodes it connects.",
// //       "You will be rewarded 15 points if you can find an arrangement of all the numbers in such a way that each edge has a unique weight.",
// //     ],
// //   },
// // ];

// // const Dashboard = () => {
// //   const navigate = useNavigate();
// //   const [isAuthenticated, setIsAuthenticated] = useState(false);
// //   const [openRules, setOpenRules] = useState({});

// //   useEffect(() => {
// //     const token = localStorage.getItem("authToken");
// //     setIsAuthenticated(!!token);
// //   }, []);

// //   const handlePlay = (path) => {
// //     if (!isAuthenticated) {
// //       navigate("/login");
// //     } else {
// //       navigate(path);
// //     }
// //   };

// //   const toggleRules = (e, id) => {
// //     e.stopPropagation();
// //     setOpenRules((prev) => ({ ...prev, [id]: !prev[id] }));
// //   };

// //   // tweak these to change how much extra scroll you want
// //   const bottomSpacerHeight = 260; // px

// //   // adjust this to match your navbar height (in px)
// //   const NAVBAR_HEIGHT = 88;
// //   const topPadding = NAVBAR_HEIGHT + 16; // extra margin under navbar
// //   const horizontalPadding = 16; // left/right padding

// //   return (
// //     <div
// //       className="dashboard bg-futuristic text-white flex flex-col items-center justify-start"
// //       style={{
// //         minHeight: "120vh",
// //         paddingTop: `${topPadding}px`,
// //         paddingInline: `${horizontalPadding}px`,
// //         boxSizing: "border-box",
// //       }}
// //     >
// //       {/* Background layers */}
// //       <div className="bg-layers" aria-hidden="true"></div>
// //       <div className="particles" aria-hidden="true">
// //         <span className="p1" />
// //         <span className="p2" />
// //         <span className="p3" />
// //         <span className="p4" />
// //         <span className="p5" />
// //       </div>

// //       <main className="w-full flex flex-col items-center justify-start px-6 py-8" style={{ width: "100%" }}>
// //         <h1 className="mb-8 text-3xl md:text-5xl font-extrabold tracking-wide neon-title text-center">
// //           Choose Your Challenge
// //         </h1>

// //         <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center mx-auto w-full max-w-5xl px-4">
// //           {games.map((g) => (
// //             <div
// //               key={g.id}
// //               className="rounded-2xl w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg transition-transform duration-300 hover:scale-105"
// //             >
// //               <article
// //                 className="relative rounded-[14px] overflow-hidden border border-white/10 shadow-2xl h-full cursor-pointer"
// //                 style={{
// //                   backgroundImage: `url(${g.image})`,
// //                   backgroundSize: "cover",
// //                   backgroundPosition: "center",
// //                   minHeight: "14rem",
// //                 }}
// //                 onClick={() => handlePlay(g.path)}
// //                 role="button"
// //                 tabIndex={0}
// //                 onKeyDown={(e) => {
// //                   if (e.key === "Enter") handlePlay(g.path);
// //                 }}
// //               >
// //                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent z-10" />

// //                 <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6">
// //                   <div className="text-lg sm:text-xl md:text-2xl tracking-widest font-semibold mb-3 text-white/90 uppercase text-center">
// //                     {g.title}
// //                   </div>

// //                   <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
// //                     <button
// //                       onClick={(e) => {
// //                         e.stopPropagation();
// //                         handlePlay(g.path);
// //                       }}
// //                       aria-label={`Play ${g.title}`}
// //                       className="relative z-20 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full backdrop-blur-sm border border-white/30 shadow-lg transition-all duration-300 hover:scale-110"
// //                     >
// //                       Play
// //                     </button>

// //                     <button
// //                       id={`rules-btn-${g.id}`}
// //                       onClick={(e) => toggleRules(e, g.id)}
// //                       aria-expanded={!!openRules[g.id]}
// //                       aria-controls={`rules-${g.id}`}
// //                       className="z-20 px-3 py-2 rounded-md bg-black/40 border border-white/10 text-sm hover:bg-black/50 transition"
// //                       onKeyDown={(e) => {
// //                         if (e.key === " " || e.key === "Enter") {
// //                           e.preventDefault();
// //                           toggleRules(e, g.id);
// //                         }
// //                       }}
// //                     >
// //                       {openRules[g.id] ? "Hide Rules" : "Rules"}
// //                     </button>
// //                   </div>
// //                 </div>

// //                 <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-20" />
// //               </article>

// //               {/* Rules panel - placed just below the corresponding game card */}
// //               <div
// //                 id={`rules-${g.id}`}
// //                 role="region"
// //                 aria-labelledby={`rules-btn-${g.id}`}
// //                 style={{
// //                   overflow: "hidden",
// //                   transition: "max-height 300ms ease, opacity 300ms ease",
// //                   maxHeight: openRules[g.id] ? 400 : 0,
// //                   opacity: openRules[g.id] ? 1 : 0,
// //                 }}
// //                 className="mt-3 px-4"
// //               >
// //                 <div
// //                   style={{
// //                     background: "rgba(255,255,255,0.03)",
// //                     border: "1px solid rgba(255,255,255,0.04)",
// //                     padding: 12,
// //                     borderRadius: 8,
// //                     color: "#e6eef8",
// //                   }}
// //                 >
// //                   <div style={{ fontWeight: 700, marginBottom: 8 }}>{g.title} — Rules</div>
// //                   <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.6 }}>
// //                     {g.rules.map((r, idx) => (
// //                       <li key={idx} style={{ marginBottom: 6 }}>
// //                         {r}
// //                       </li>
// //                     ))}
// //                   </ul>
// //                 </div>
// //               </div>
// //             </div>
// //           ))}
// //         </div>

// //         {/* extra bottom spacer to increase scroll length */}
// //         <div style={{ height: bottomSpacerHeight }} />
// //       </main>
// //     </div>
// //   );
// // };

// // export default Dashboard;



// import { useNavigate } from "react-router-dom";
// import React, { useEffect, useState } from "react";
// import "./dashboard.css";

// const games = [
//   {
//     id: "game1",
//     title: "GAME 1",
//     path: "/game1",
//     image: "/assets/game1bg.png",
//     rules: [
//       "The game consists of a 3x3 grid filled with 0,1,2.",
//       "Each click on a cell increments its value and its adjacent cell's values by 1 modulo 3.",
//       "You will be rewarded 75 points if you can make all cells 0 in the grid.",
//     ],
//   },
//   {
//     id: "game2",
//     title: "GAME 2",
//     path: "/game2",
//     image: "/assets/game2bg.png",
//     rules: [
//       "You are given a tree with 7 nodes and values 1,3,5,7,9,11,13.",
//       "The weight of the edge is calculated as the absolute difference of the values of the two nodes it connects.",
//       "You will be rewarded 15 points if you can find an arrangement of all the numbers in such a way that each edge has a unique weight.",
//     ],
//   },
// ];

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem("authToken");
//     setIsAuthenticated(!!token);
//   }, []);

//   const handlePlay = (path) => {
//     if (!isAuthenticated) {
//       navigate("/login");
//     } else {
//       navigate(path);
//     }
//   };

//   // tweak these to change how much extra scroll you want
//   const bottomSpacerHeight = 260; // px

//   // adjust this to match your navbar height (in px)
//   const NAVBAR_HEIGHT = 88;
//   const topPadding = NAVBAR_HEIGHT + 16; // extra margin under navbar
//   const horizontalPadding = 16; // left/right padding

//   return (
//     <div
//       className="dashboard bg-futuristic text-white flex flex-col items-center justify-start"
//       style={{
//         minHeight: "120vh",
//         paddingTop: `${topPadding}px`,
//         paddingInline: `${horizontalPadding}px`,
//         boxSizing: "border-box",
//       }}
//     >
//       {/* Background layers */}
//       <div className="bg-layers" aria-hidden="true"></div>
//       <div className="particles" aria-hidden="true">
//         <span className="p1" />
//         <span className="p2" />
//         <span className="p3" />
//         <span className="p4" />
//         <span className="p5" />
//       </div>

//       <main className="w-full flex flex-col items-center justify-start px-6 py-8" style={{ width: "100%" }}>
//         {/* Rules button placed above the heading */}
//         <div style={{ width: "100%", maxWidth: 980, display: "flex", justifyContent: "center", marginBottom: 12 }}>
//           <button
//             onClick={() => navigate("/rules")}
//             className="px-8 py-8 rounded-md bg-indigo-600 hover:bg-indigo-500 transition text-white font-semibold shadow-md"
//             aria-label="View game rules"
//           >
//             View Rules
//           </button>
//         </div>

//         <h1 className="mb-8 text-3xl md:text-5xl font-extrabold tracking-wide neon-title text-center">
//           Choose Your Challenge
//         </h1>

//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center mx-auto w-full max-w-5xl px-4">
//           {games.map((g) => (
//             <div
//               key={g.id}
//               className="rounded-2xl w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg transition-transform duration-300 hover:scale-105"
//             >
//               <article
//                 className="relative rounded-[14px] overflow-hidden border border-white/10 shadow-2xl h-full cursor-pointer"
//                 style={{
//                   backgroundImage: `url(${g.image})`,
//                   backgroundSize: "cover",
//                   backgroundPosition: "center",
//                   minHeight: "14rem",
//                 }}
//                 onClick={() => handlePlay(g.path)}
//                 role="button"
//                 tabIndex={0}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") handlePlay(g.path);
//                 }}
//               >
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent z-10" />

//                 <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6">
//                   <div className="text-lg sm:text-xl md:text-2xl tracking-widest font-semibold mb-3 text-white/90 uppercase text-center">
//                     {g.title}
//                   </div>

//                   <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handlePlay(g.path);
//                       }}
//                       aria-label={`Play ${g.title}`}
//                       className="relative z-20 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full backdrop-blur-sm border border-white/30 shadow-lg transition-all duration-300 hover:scale-110"
//                     >
//                       Play
//                     </button>
//                   </div>
//                 </div>

//                 <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-20" />
//               </article>
//             </div>
//           ))}
//         </div>

//         {/* extra bottom spacer to increase scroll length */}
//         <div style={{ height: bottomSpacerHeight }} />
//       </main>
//     </div>
//   );
// };

// export default Dashboard;




import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "./dashboard.css";

const games = [
  {
    id: "game1",
    title: "GAME 1",
    path: "/game1",
    image: "/assets/game1bg.png",
    rules: [
      "The game consists of a 3x3 grid filled with 0,1,2.",
      "Each click on a cell increments its value and its adjacent cell's values by 1 modulo 3.",
      "You will be rewarded 75 points if you can make all cells 0 in the grid.",
    ],
  },
  {
    id: "game2",
    title: "GAME 2",
    path: "/game2",
    image: "/assets/game2bg.png",
    rules: [
      "You are given a tree with 7 nodes and values 1,3,5,7,9,11,13.",
      "The weight of the edge is calculated as the absolute difference of the values of the two nodes it connects.",
      "You will be rewarded 15 points if you can find an arrangement of all the numbers in such a way that each edge has a unique weight.",
    ],
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

  const bottomSpacerHeight = 260;
  const NAVBAR_HEIGHT = 88;
  const topPadding = NAVBAR_HEIGHT + 2;
  const horizontalPadding = 16;

  return (
    <div
      className="dashboard bg-futuristic text-white flex flex-col items-center justify-start"
      style={{
        minHeight: "120vh",
        paddingTop: `${topPadding}px`,
        paddingInline: `${horizontalPadding}px`,
        boxSizing: "border-box",
      }}
    >
      {/* Background layers */}
      <div className="bg-layers" aria-hidden="true"></div>
      <div className="particles" aria-hidden="true">
        <span className="p1" />
        <span className="p2" />
        <span className="p3" />
        <span className="p4" />
        <span className="p5" />
      </div>

      <main className="w-full flex flex-col items-center justify-start px-6 py-2" style={{ width: "100%" }}>
        {/* ✨ Stylish Rules Button */}
        <div className="flex justify-center w-full max-w-5xl mb-8">
          <button
            onClick={() => navigate("/rules")}
            className="relative group px-8 py-2 text-lg font-semibold text-cyan-300 uppercase tracking-wide
                      rounded-2xl overflow-hidden bg-[#0f172a]/80 border border-cyan-400/40 shadow-[0_0_25px_rgba(0,255,255,0.15)]
                      transition-all duration-300 hover:scale-105 hover:text-white focus:outline-none"
            aria-label="View game rules"
          >
            {/* Soft background gradient glow */}
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 opacity-70 blur-md group-hover:opacity-90 group-hover:blur-xl transition-all duration-500 rounded-2xl"></span>

            {/* Outer glowing border */}
            <span className="absolute inset-0 rounded-2xl border border-cyan-400/70 group-hover:border-cyan-300 shadow-[0_0_12px_rgba(0,255,255,0.4)]"></span>

            {/* Inner glow effect */}
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/30 to-transparent opacity-60"></span>

            {/* Text layer */}
            <span className="relative z-10 px-2 tracking-wider">View Rules</span>
          </button>
        </div>

        <br/>
        {/* Title */}
        <h1 className="mb-8 text-3xl md:text-5xl font-extrabold tracking-wide neon-title text-center">
          Choose Your Challenge
        </h1>

        {/* Game Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center mx-auto w-full max-w-5xl px-4">
          {games.map((g) => (
            <div
              key={g.id}
              className="rounded-2xl w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg transition-transform duration-300 hover:scale-105"
            >
              <article
                className="relative rounded-[14px] overflow-hidden border border-white/10 shadow-2xl h-full cursor-pointer"
                style={{
                  backgroundImage: `url(${g.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  minHeight: "14rem",
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

                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlay(g.path);
                      }}
                      aria-label={`Play ${g.title}`}
                      className="relative z-20 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 
                                 rounded-full backdrop-blur-sm border border-white/30 shadow-lg transition-all duration-300 hover:scale-110"
                    >
                      Play
                    </button>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-20" />
              </article>
            </div>
          ))}
        </div>

        {/* Spacer for scroll */}
        <div style={{ height: bottomSpacerHeight }} />
      </main>
    </div>
  );
};

export default Dashboard;
