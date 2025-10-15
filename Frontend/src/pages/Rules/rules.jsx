import React, { useState } from "react";
import "./rules.css";

const RulesPage = () => {
  const [expandedGame, setExpandedGame] = useState(null);

  const games = [
    {
      id: 1,
      title: "Grid Tap Puzzle",
      subtitle: "Master the Matrix",
      icon: "🎯",
      color: "cyan",
      points: 75,
      difficulty: "Medium",
      description: "Transform a 3×3 grid of numbers into all zeros through strategic tapping.",
      rules: [
        {
          label: "Grid Setup",
          text: "You have a 3×3 grid of cells. Each cell holds a number from 0, 1, or 2."
        },
        {
          label: "Tap Mechanics",
          text: "When you tap a cell, that cell and its direct neighbors (up, down, left, right) all increase by 1."
        },
        {
          label: "Modulo Operation",
          text: "Numbers cycle through mod 3: 0 → 1 → 2 → 0"
        },
        {
          label: "Victory Condition",
          text: "Make all cells in the grid equal to 0 to win 75 points."
        }
      ],
      example: {
        title: "Example Solution",
        description: "From the initial grid, perform 6 taps at positions:",
        positions: "(1,1), (1,1), (1,2), (1,2), (3,2), (3,2)"
      }
    },
    {
      id: 2,
      title: "Constellation Puzzle",
      subtitle: "Connect the Stars",
      icon: "⭐",
      color: "purple",
      points: 15,
      difficulty: "Hard",
      description: "Arrange numbers on a tree structure to create unique edge weights.",
      rules: [
        {
          label: "Tree Structure",
          text: "The puzzle presents a tree or constellation with 7 nodes."
        },
        {
          label: "Number Assignment",
          text: "Fill nodes with numbers from the set: 1, 3, 5, 7, 9, 11, 13."
        },
        {
          label: "Edge Weight",
          text: "Edge weight is the absolute difference between two connected nodes."
        },
        {
          label: "Victory Condition",
          text: "Ensure all edge weights are unique to secure 15 points."
        }
      ],
      example: {
        title: "Pro Tip",
        description: "Strategic placement ensures maximum edge weight diversity.",
        positions: null
      }
    }
  ];

  const toggleGame = (gameId) => {
    setExpandedGame(expandedGame === gameId ? null : gameId);
  };

  return (
    <div className="rules-wrapper">
      {/* Animated Background */}
      <div className="rules-background">
        <div className="bg-orb orb-cyan"></div>
        <div className="bg-orb orb-purple"></div>
        <div className="bg-orb orb-pink"></div>
        <div className="grid-mesh"></div>
      </div>

      {/* Floating Particles */}
      <div className="rules-particles">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`rules-particle particle-${i + 1}`}></div>
        ))}
      </div>

      <div className="rules-container">
        {/* Header Section */}
        <header className="rules-header">
          <div className="header-badge">
            <svg className="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Official Rulebook</span>
          </div>
          
          <h1 className="rules-title">
            <span className="title-main">Game Rules</span>
            <span className="title-sub">& Strategy Guide</span>
          </h1>
          
          <p className="rules-description">
            Master the mechanics, dominate the leaderboard
          </p>

          <div className="header-decoration"></div>
        </header>

        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{games.length}</div>
              <div className="stat-label">Games</div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{games.reduce((sum, g) => sum + g.points, 0)}</div>
              <div className="stat-label">Total Points</div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">∞</div>
              <div className="stat-label">Strategies</div>
            </div>
          </div>
        </div>

        {/* Game Cards */}
        <div className="games-section">
          {games.map((game, index) => (
            <article 
              key={game.id} 
              className={`game-rule-card game-${game.color} ${expandedGame === game.id ? 'expanded' : ''}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Card Header */}
              <div className="card-header" onClick={() => toggleGame(game.id)}>
                <div className="card-header-left">
                  <div className="game-icon-wrapper">
                    <span className="game-icon">{game.icon}</span>
                    <div className="icon-glow"></div>
                  </div>
                  
                  <div className="game-header-info">
                    <div className="game-meta">
                      <span className="game-number">Game {game.id}</span>
                      <span className="difficulty-badge">{game.difficulty}</span>
                    </div>
                    <h2 className="game-title">{game.title}</h2>
                    <p className="game-subtitle">{game.subtitle}</p>
                  </div>
                </div>

                <div className="card-header-right">
                  <div className="points-display">
                    <svg className="points-star-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span className="points-value">{game.points}</span>
                  </div>
                  
                  <button className="expand-button" aria-label={expandedGame === game.id ? "Collapse" : "Expand"}>
                    <svg 
                      className={`expand-icon ${expandedGame === game.id ? 'rotated' : ''}`} 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Card Description */}
              <div className="card-description">
                <p>{game.description}</p>
              </div>

              {/* Expandable Content */}
              <div className={`card-content ${expandedGame === game.id ? 'show' : ''}`}>
                <div className="rules-list">
                  <h3 className="rules-list-title">
                    <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    How to Play
                  </h3>
                  
                  {game.rules.map((rule, idx) => (
                    <div key={idx} className="rule-item">
                      <div className="rule-number">{idx + 1}</div>
                      <div className="rule-content">
                        <h4 className="rule-label">{rule.label}</h4>
                        <p className="rule-text">{rule.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Example Section */}
                <div className="example-section">
                  <h3 className="example-title">
                    <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    {game.example.title}
                  </h3>
                  <p className="example-description">{game.example.description}</p>
                  {game.example.positions && (
                    <div className="example-code">
                      <code>{game.example.positions}</code>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Border Effect */}
              <div className="card-border-effect"></div>
            </article>
          ))}
        </div>

        {/* Footer Tips */}
        <div className="tips-section">
          <div className="tip-card">
            <div className="tip-icon">💡</div>
            <div className="tip-content">
              <h3 className="tip-title">Pro Tip</h3>
              <p className="tip-text">Practice makes perfect! Try different strategies to master each game.</p>
            </div>
          </div>

          <div className="tip-card">
            <div className="tip-icon">🎮</div>
            <div className="tip-content">
              <h3 className="tip-title">Challenge Yourself</h3>
              <p className="tip-text">Aim for the minimum number of moves to achieve the highest efficiency!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesPage;