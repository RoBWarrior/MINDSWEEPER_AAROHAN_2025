// src/pages/Rules.jsx
import React from "react";

function Rules() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">Game Rules</h1>
      <br />
      <h2 className="text-xl font-semibold mt-2 text-white">Objective</h2>
      <p className="mb-2 text-white">
        ?Name? has played the famous JUMANJI game and has received a challenge
        during the course of the game. As he is very lazy and weak at
        mathematics, he requires your help to resolve the challenges and
        complete the gaming adventure.
      </p>

      <h2 className="text-xl font-semibold mt-2">Gameplay</h2>
      <p className="mb-2 text-white">Card Game
        You are given 6 blank sections for operands and 5 for operators.
        You are given 6 × 2 = 12 cards with numbers visible on them.
        Choose an empty section and then choose a card. 
        The data gets inserted into the blank section, and that card cannot be used anymore.
        Operators will be placed on the user's choice sequentially from left to right. 
        Operators available: (+ , - , × , ÷)
        Division used here is integer division.
        The whole answer will be processed from left to right.
        The user has to play at least 3 moves, i.e., 3 cards must be placed into the empty places.
        If the user achieves the given target value within the required number of moves, they win and score 15 points.
        Else, they lose and have to play again.
       </p>
       <br />
       <p className="mb-2 text-white">“Path and Pool”
            You are given a pool of operands and operators. 
            You’re also given a target number to achieve.
            You need to use the operators and operands in correct sequence to achieve the target.
       </p>
    <br />
    </div>
  );
}

export default Rules;