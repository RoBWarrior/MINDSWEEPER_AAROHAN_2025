import React, { useEffect, useState } from "react";
import "./Leaderboard.css";

const ITEMS_PER_PAGE = 10;

const Spinner = () => (
  <div className="spinner-container">
    <div className="spinner">
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
      <div className="spinner-core"></div>
    </div>
    <p className="loading-text">Loading Rankings...</p>
  </div>
);

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [animateRanks, setAnimateRanks] = useState(false);

  const totalItems = leaderboard.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageData = leaderboard.slice(startIndex, endIndex);

  const getLeaderBoard = () => {
    fetch(`${import.meta.env.VITE_BACKEND_BASE}/api/leaderboard`)
      .then((response) => response.json())
      .then((data) => {
        setLeaderboard(data.leaderboard || []);
        setTimeout(() => setAnimateRanks(true), 100);
      })
      .catch((err) => console.error("Error fetching leaderboard data:", err));
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      getLeaderBoard();
      setLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    setAnimateRanks(false);
    setTimeout(() => setAnimateRanks(true), 50);
  }, [currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const getMedalIcon = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  const getRankClass = (rank) => {
    if (rank === 1) return "rank-gold";
    if (rank === 2) return "rank-silver";
    if (rank === 3) return "rank-bronze";
    return "rank-default";
  };

  return (
    <div className="leaderboard-wrapper">
      {/* Animated Background */}
      <div className="leaderboard-background">
        <div className="bg-gradient gradient-1"></div>
        <div className="bg-gradient gradient-2"></div>
        <div className="bg-gradient gradient-3"></div>
        <div className="grid-pattern"></div>
        <div className="scanline"></div>
      </div>

      {/* Particles */}
      <div className="particles-bg">
        {[...Array(15)].map((_, i) => (
          <div key={i} className={`particle-dot particle-${i + 1}`}></div>
        ))}
      </div>

      <div className="leaderboard-container">
        {/* Header Section */}
        <div className="header-section">
          <div className="title-decoration-top"></div>
          <h1 className="leaderboard-title">
            <span className="title-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </span>
            <span className="title-text">Leaderboard</span>
          </h1>
          <p className="leaderboard-subtitle">Top Performers Worldwide</p>
          <div className="title-decoration-bottom"></div>
        </div>

        {/* Content */}
        <div className="leaderboard-content">
          {loading ? (
            <Spinner />
          ) : currentPageData.length ? (
            <>
              {/* Podium for Top 3 */}
              {currentPage === 1 && (
                <div className="podium-section">
                  {[1, 0, 2].map((idx) => {
                    const player = leaderboard[idx];
                    if (!player) return null;
                    const rank = idx + 1;
                    return (
                      <div 
                        key={rank} 
                        className={`podium-card podium-${rank}`}
                        style={{ animationDelay: `${idx * 0.2}s` }}
                      >
                        <div className="podium-rank-badge">
                          <span className="podium-medal">{getMedalIcon(rank)}</span>
                          <span className="podium-number">#{rank}</span>
                        </div>
                        <div className="podium-avatar">
                          <div className="avatar-glow"></div>
                          <span className="avatar-text">
                            {player.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <h3 className="podium-username">{player.username}</h3>
                        <div className="podium-points">
                          <svg className="points-star" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <span className="points-value">{player.points}</span>
                          <span className="points-label">pts</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Leaderboard List */}
              <div className="leaderboard-list">
                {currentPageData.map((elem, index) => {
                  const overallRank = startIndex + index + 1;
                  const rankClass = getRankClass(overallRank);
                  const medal = getMedalIcon(overallRank);

                  return (
                    <div
                      key={`${elem.username}-${overallRank}`}
                      className={`leaderboard-row ${rankClass} ${animateRanks ? 'animate-in' : ''}`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="row-background"></div>
                      <div className="row-border"></div>
                      
                      <div className="row-rank">
                        {medal ? (
                          <span className="rank-medal">{medal}</span>
                        ) : (
                          <span className="rank-number">{overallRank}</span>
                        )}
                      </div>

                      <div className="row-player">
                        <div className="player-avatar">
                          {elem.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="player-name">{elem.username}</span>
                      </div>

                      <div className="row-points">
                        <div className="points-container">
                          <span className="points-number">{elem.points}</span>
                          <span className="points-text">pts</span>
                        </div>
                      </div>

                      <div className="row-shine"></div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="pagination-button prev-button"
                    aria-label="Previous page"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous</span>
                  </button>

                  <div className="pagination-info">
                    <span className="page-current">{currentPage}</span>
                    <span className="page-separator">/</span>
                    <span className="page-total">{totalPages}</span>
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="pagination-button next-button"
                    aria-label="Next page"
                  >
                    <span>Next</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="empty-title">No Rankings Yet</h3>
              <p className="empty-text">Be the first to climb the leaderboard!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;