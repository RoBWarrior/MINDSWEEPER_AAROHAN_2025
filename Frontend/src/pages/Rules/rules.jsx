import React from "react";

const RulesPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] text-white flex flex-col items-center px-6 sm:px-10 py-28 sm:py-32 mt-10 sm:mt-20">
    
      <br />

      <h1 className="text-4xl sm:text-4xl md:text-5xl font-extrabold mb-14 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-[0_0_15px_rgba(0,255,255,0.6)]">
         Game Rules
      </h1>
    
<br />
<br />
      <div className="max-w-5xl w-full flex flex-col gap-14">
        {/* Game 1 Card */}
        <div className="relative group bg-[#0a0f1c]/70 border border-cyan-400/30 rounded-2xl p-8 sm:p-10 shadow-[0_0_25px_rgba(0,255,255,0.15)] hover:shadow-[0_0_40px_rgba(0,255,255,0.4)] transition-all duration-500 backdrop-blur-md mt-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-5 text-cyan-400 mt-5">
            Game 1: Grid Tap Puzzle
          </h2>
          <br />
          <p className="leading-relaxed text-gray-300">
            You have a <span className="text-cyan-300 font-semibold">3×3 grid</span> of cells.  
            Each cell holds a number from <span className="text-blue-400">0, 1, or 2</span>.  
            When you tap a cell, that cell and its direct neighbors 
            (<span className="text-blue-400">up, down, left, right</span>) all increase by 1.  
            Numbers are taken <span className="text-cyan-400 font-semibold">mod 3</span>:  
            <br />
            <code className="text-sm text-cyan-300">0 → 1 → 2 → 0</code>
            <br />
            The goal is to make the entire grid become <span className="text-cyan-400 font-semibold">all 0s</span>.
          </p>

          <div className="mt-6 p-5 rounded-lg bg-[#020617]/80 border border-cyan-500/30">
            <p className="text-gray-300 text-sm leading-relaxed">
              Example: From the initial grid, we perform <b>6 taps</b> at positions  
              <span className="text-cyan-300 font-semibold"> (1,1), (1,1), (1,2), (1,2), (3,2), (3,2)</span>  
              (using 1-based indexing).
            </p>
          </div>

          <div className="absolute inset-0 rounded-2xl border border-cyan-400/10 opacity-0 group-hover:opacity-100 blur-lg transition duration-700" />
        </div>

        {/* Game 2 Card */}
        <div className="relative group bg-[#0a0f1c]/70 border border-purple-400/30 rounded-2xl p-8 sm:p-10 shadow-[0_0_25px_rgba(200,100,255,0.15)] hover:shadow-[0_0_40px_rgba(200,100,255,0.4)] transition-all duration-500 backdrop-blur-md">
          <h2 className="text-2xl md:text-3xl font-bold mb-5 text-purple-400">
             Game 2: Math Crossword Puzzle
          </h2>
          <br />
          <p className="leading-relaxed text-gray-300">
            The puzzle looks like a <span className="text-purple-300 font-semibold">crossword grid</span>.  
            Each horizontal and vertical line forms an <span className="text-purple-300 font-semibold">equation</span>.  
            You must fill the blanks with numbers (<span className="text-purple-400">0–9</span> only).  
            The <span className="text-purple-400 font-semibold">operators (+, −, ×, ÷)</span> are fixed.
          </p>
          <p className="mt-3 text-gray-300">
            Evaluations are done <span className="text-purple-400 font-semibold">left to right</span>  
            — no BODMAS.
          </p>

          <div className="mt-6 p-5 rounded-lg bg-[#1e1b29]/80 border border-purple-500/30">
            <p className="text-gray-300 text-sm">
              Example: <code className="text-purple-300 font-semibold">7 + 2 × 3</code>  
              is evaluated as <code className="text-purple-300 font-semibold">(7 + 2) × 3 = 27</code>.
            </p>
          </div>

          <div className="absolute inset-0 rounded-2xl border border-purple-400/10 opacity-0 group-hover:opacity-100 blur-lg transition duration-700" />
        </div>
      </div>

      <div className="mt-10" />
    </div>
  );
};

export default RulesPage;
