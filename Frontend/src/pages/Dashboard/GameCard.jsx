import React from "react";
import "./dashboard.css";

export default function GameCard({
  title,
  imgUrl,
  label = null,
  onClick = () => {},
}) {
  return (
    <div className="relative flex flex-col items-center">
      <button
        onClick={onClick}
        className="game-card neon-card relative w-72 md:w-80 h-96 rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-350
                   hover:scale-[1.035] focus:outline-none focus:ring-4 focus:ring-purple-600"
        aria-label={`Open ${title}`}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imgUrl})` }}
          role="img"
          aria-hidden="true"
        />

        {/* Soft gradient overlay to unify color grade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60" />

        {/* Card content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 z-10 text-center">
          <span className="card-title text-white text-2xl md:text-3xl font-extrabold tracking-wider drop-shadow-lg">
            {title}
          </span>
          {label && (
            <span className="mt-3 text-sm text-gray-200/90 bg-black/30 px-3 py-1 rounded-full">
              {label}
            </span>
          )}
        </div>

        {/* Neon outline & glossy highlight implemented via CSS pseudo-element */}
      </button>

      {/* Play CTA overlay below the card (centered) */}
      <button
        onClick={onClick}
        className="mt-4 play-btn inline-flex items-center justify-center w-20 h-12 rounded-xl font-semibold tracking-wide shadow-lg
                   focus:outline-none focus:ring-4 focus:ring-purple-500"
        aria-label={`Play ${title}`}
      >
        ▶ Play
      </button>
    </div>
  );
}
