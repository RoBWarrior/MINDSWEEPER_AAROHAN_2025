import React from "react";

const RulesPage = () => {
  return (
    <div className="h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] text-white flex justify-center overflow-y-auto">
      {/* Scrollable content */}
      <div className="w-full max-w-5xl px-6 sm:px-10 py-8 flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-[0_0_15px_rgba(0,255,255,0.6)]">
          Game Rules
        </h1>
        <br />
        <div className="flex flex-col items-center gap-10 w-full">
          {/* Game 1 Card */}
          <div className="w-full max-w-md relative group bg-[#0a0f1c]/70 border border-cyan-400/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_25px_rgba(0,255,255,0.15)] hover:shadow-[0_0_40px_rgba(0,255,255,0.4)] transition-all duration-500 backdrop-blur-md">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-cyan-400">
              Game 1: Grid Tap Puzzle
            </h2>
            <p className="leading-relaxed text-gray-300">
              You have a <span className="text-cyan-300 font-semibold">3×3 grid</span> of cells.
              Each cell holds a number from <span className="text-blue-400">0, 1, or 2</span>.
              When you tap a cell, that cell and its direct neighbors
              (<span className="text-blue-400">up, down, left, right</span>) all increase by 1.
              Numbers are taken <span className="text-cyan-400 font-semibold">mod 3</span>:
            </p>
            <div className="mt-3">
              <code className="text-sm text-cyan-300 block">0 → 1 → 2 → 0</code>
            </div>
            <div className="mt-4 p-4 rounded-lg bg-[#020617]/80 border border-cyan-500/30 text-gray-300 text-sm">
              Example: From the initial grid, we perform <b>6 taps</b> at positions
              <span className="text-cyan-300 font-semibold"> (1,1), (1,1), (1,2), (1,2), (3,2), (3,2)</span>.
            </div>
          </div>

          {/* Game 2 Card */}
          <div className="w-full max-w-md relative group bg-[#0a0f1c]/70 border border-purple-400/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_25px_rgba(200,100,255,0.15)] hover:shadow-[0_0_40px_rgba(200,100,255,0.4)] transition-all duration-500 backdrop-blur-md">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-purple-400">
              Game 2: Constellation Puzzle
            </h2>
            <p className="leading-relaxed text-gray-300">
              The puzzle looks like a <span className="text-purple-300 font-semibold">tree or a constellation</span>.
              One has to fill the nodes of the tree with numbers from <span className="text-purple-300 font-semibold">1 to 13</span> ensuring that no two adjacent nodes have a difference of <span className="text-purple-300 font-semibold">1</span> to secure a score of <span className="text-purple-300 font-semibold">15</span> points.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesPage;