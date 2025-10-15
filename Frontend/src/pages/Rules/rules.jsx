// import React from "react";

// const RulesPage = () => {
//   return (
//     <div className="h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] text-white flex justify-center overflow-y-auto">
//       {/* Scrollable content */}
//       <div className="w-full max-w-5xl px-6 sm:px-10 py-8 flex flex-col items-center">
//         <h1 className="text-4xl sm:text-5xl font-extrabold mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-[0_0_15px_rgba(0,255,255,0.6)]">
//           Game Rules
//         </h1>
//         <br />
//         <div className="flex flex-col items-center gap-10 w-full">
//           {/* Game 1 Card */}
//           <div className="w-full max-w-md relative group bg-[#0a0f1c]/70 border border-cyan-400/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_25px_rgba(0,255,255,0.15)] hover:shadow-[0_0_40px_rgba(0,255,255,0.4)] transition-all duration-500 backdrop-blur-md">
//             <h2 className="text-2xl md:text-3xl font-bold mb-4 text-cyan-400">
//               Game 1: Grid Tap Puzzle
//             </h2>
//             <p className="leading-relaxed text-gray-300">
//               You have a <span className="text-cyan-300 font-semibold">3×3 grid</span> of cells.
//               Each cell holds a number from <span className="text-blue-400">0, 1, or 2</span>.
//               When you tap a cell, that cell and its direct neighbors
//               (<span className="text-blue-400">up, down, left, right</span>) all increase by 1.
//               Numbers are taken <span className="text-cyan-400 font-semibold">mod 3</span>:
//             </p>
//             <div className="mt-3">
//               <code className="text-sm text-cyan-300 block">0 → 1 → 2 → 0</code>
//             </div>
//             <div className="mt-4 p-4 rounded-lg bg-[#020617]/80 border border-cyan-500/30 text-gray-300 text-sm">
//               Example: From the initial grid, we perform <b>6 taps</b> at positions
//               <span className="text-cyan-300 font-semibold"> (1,1), (1,1), (1,2), (1,2), (3,2), (3,2)</span>.
//             </div>
//           </div>

//           {/* Game 2 Card */}
//           <div className="w-full max-w-md relative group bg-[#0a0f1c]/70 border border-purple-400/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_25px_rgba(200,100,255,0.15)] hover:shadow-[0_0_40px_rgba(200,100,255,0.4)] transition-all duration-500 backdrop-blur-md">
//             <h2 className="text-2xl md:text-3xl font-bold mb-4 text-purple-400">
//               Game 2: Constellation Puzzle
//             </h2>
//             <p className="leading-relaxed text-gray-300">
//               The puzzle looks like a <span className="text-purple-300 font-semibold">tree or a constellation</span>.
//               One has to fill the nodes of the tree with numbers from <span className="text-purple-300 font-semibold">1 to 13</span> ensuring that no two adjacent nodes have a difference of <span className="text-purple-300 font-semibold">1</span> to secure a score of <span className="text-purple-300 font-semibold">15</span> points.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RulesPage;





import React from "react";

const RulesPage = () => {
  return (
    <>
      {/* Google font — move to index.html <head> for production */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap"
      />

      <div
        className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] text-white flex justify-center"
        style={{
          // global font + safe fallback stack
          fontFamily:
            'Poppins, Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
          // ensure scrolling if content exceeds viewport
          overflowY: "auto",
          paddingTop: 28, // keeps content away from top nav if fixed
          paddingBottom: 48,
          paddingLeft: 16,
          paddingRight: 16,
          boxSizing: "border-box",
        }}
      >
        {/* Scrollable content */}
        <div
          className="w-full"
          style={{
            maxWidth: 1100,
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 32,
            paddingBottom: 48,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 40,
            boxSizing: "border-box",
          }}
        >
          <h1
            className="text-4xl sm:text-5xl font-extrabold text-center"
            style={{
              margin: 0,
              lineHeight: 1.05,
              // gradient text look retained
              background:
                "linear-gradient(90deg, rgba(56,189,248,1), rgba(59,130,246,1))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              textShadow: "0 6px 18px rgba(0,255,255,0.06)",
            }}
          >
            Game Rules
          </h1>

          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 28,
            }}
          >
            {/* Game 1 Card */}
            <div
              className="group"
              style={{
                width: "100%",
                maxWidth: 720,
                background: "rgba(10,15,28,0.72)",
                border: "1px solid rgba(6,182,212,0.12)",
                borderRadius: 16,
                padding: 22,
                boxShadow: "0 0 25px rgba(0,255,255,0.06)",
                backdropFilter: "blur(8px)",
                boxSizing: "border-box",
                marginInline: "auto",
              }}
            >
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  margin: "0 0 10px 0",
                  color: "#06b6d4",
                }}
              >
                Game 1: Grid Tap Puzzle
              </h2>

              <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.6 }}>
                You have a <strong className="text-cyan-300">3×3 grid</strong> of
                cells. Each cell holds a number from{" "}
                <strong style={{ color: "#60a5fa" }}>0, 1, or 2</strong>. When you
                tap a cell, that cell and its direct neighbors (
                <strong style={{ color: "#60a5fa" }}>up, down, left, right</strong>
                ) all increase by 1. One Can win <strong style={{ color: "#06b6d4" }}>75</strong> points by making all the cells of the grid to 0. <br/> Numbers are taken{" "}
                <strong style={{ color: "#06b6d4" }}>mod 3</strong>:
              </p>

              <div
                style={{
                  marginTop: 12,
                  display: "inline-block",
                  padding: 10,
                  borderRadius: 8,
                  background: "rgba(2,6,23,0.6)",
                  border: "1px solid rgba(6,182,212,0.06)",
                }}
              >
                <code style={{ color: "#06b6d4", fontSize: 13 }}>0 → 1 → 2 → 0</code>
              </div>

              <div
                style={{
                  marginTop: 14,
                  padding: 14,
                  borderRadius: 10,
                  background: "rgba(2,6,23,0.52)",
                  border: "1px solid rgba(6,182,212,0.06)",
                  color: "#cbd5e1",
                  fontSize: 14,
                }}
              >
                Example: From the initial grid, we perform <strong>6 taps</strong> at
                positions{" "}
                <strong style={{ color: "#06b6d4" }}>
                  (1,1), (1,1), (1,2), (1,2), (3,2), (3,2)
                </strong>
                .
              </div>
            </div>

            {/* Game 2 Card */}
            <div
              className="group"
              style={{
                width: "100%",
                maxWidth: 720,
                background: "rgba(10,15,28,0.72)",
                border: "1px solid rgba(139,92,246,0.10)",
                borderRadius: 16,
                padding: 22,
                boxShadow: "0 0 25px rgba(139,92,246,0.06)",
                backdropFilter: "blur(8px)",
                boxSizing: "border-box",
                marginInline: "auto",
              }}
            >
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  margin: "0 0 10px 0",
                  color: "#a78bfa",
                }}
              >
                Game 2: Constellation Puzzle
              </h2>

              <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.6 }}>
                The puzzle looks like a <strong style={{ color: "#c084fc" }}>tree or
                a constellation</strong>. One has to fill the nodes of the tree
                with numbers from <strong style={{ color: "#c084fc" }}>1,3,5,7,9,11,13</strong>{" "}
                ensuring that no two edge weights are the same. Edge weight is the absolute difference of the two nodes the edge connects.{" "}
                One can secure a score of{" "}
                <strong style={{ color: "#c084fc" }}>15</strong> points by getting the right configuration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RulesPage;
