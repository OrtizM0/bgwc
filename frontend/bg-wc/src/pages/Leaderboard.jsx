// Leaderboard.jsx
// Displays the final scores of a game, allows viewing detailed breakdown per player.
// Handles session cleanup and redirection if data is missing.

import './Leaderboard.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faCrown, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { iconOptions } from '../components/PlayerSelect';
import { useEffect, useState, useRef } from 'react';

function Leaderboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;  // Game result data passed from Game component
  const [selectedPlayerId, setSelectedPlayerId] = useState(null); // Player whose score breakdown is open

  // Session validation and cleanup
  useEffect(() => {
    const roomCode = window.location.pathname.split('/').pop();

    if (!data) {
      // If no data passed, attempt to restore from localStorage
      const stored = localStorage.getItem(`winner-${roomCode}`);
      if (stored) {
        navigate('.', { replace: true, state: JSON.parse(stored) });
      } else {
        // No session data found, redirect to home
        navigate('/');
      }
      return;
    }

    // Cleanup localStorage for previous sessions
    localStorage.removeItem('bgwc-session');
    localStorage.removeItem('bgwc-phase');
    localStorage.removeItem(`winner-${roomCode}`);
  }, [data, navigate]);

  if (!data) return null; // Prevent rendering without data

  const rankedPlayers = data.players || [];
  const hasTies = data.hasTies;

  // Convert rank to ordinal suffix
  const getOrdinalSuffix = (rank) => {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  };

  // Ref to detect clicks outside a player's score breakdown
  const openRef = useRef(null);

  // Close player slideout when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openRef.current && !openRef.current.contains(e.target)) {
        setSelectedPlayerId(null);
      }
    };

    if (selectedPlayerId) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedPlayerId]);

  // Fields that are not counted toward total scoring (display only)
  const NON_SCORING_LABELS = ['Longest Route Length'];

  // Filter out non-scoring fields from player's breakdown
  const getDisplayableDetails = (details = []) => {
    return details.filter(entry => !NON_SCORING_LABELS.includes(entry.label));
  };

  return (
    <div className="container">
      <div className="leaderboard">
        <h2>{data.gameTitle}</h2>
        <div className="leaderboard__container">
          <div className="leaderboard__container-list">
            {rankedPlayers.map((player) => {
              const icon = iconOptions.find(i => i.iconName === player.icon);
              const isOpen = selectedPlayerId === player.id;

              return (
                <div key={player.id} style={{ position: 'relative' }} ref={isOpen ? openRef : null}>
                  {/* Player row */}
                  <div
                    className="leaderboard__container-list--item"
                    onClick={() =>
                      setSelectedPlayerId(isOpen ? null : player.id)
                    }
                  >
                    {/* Ranking */}
                    <div className="container-list--item-ranking">
                      <h3>{player.rank}</h3>
                      <h6>{getOrdinalSuffix(player.rank)}</h6>
                    </div>

                    {/* Player info */}
                    <div className="container-list--item-player">
                      <div className="item-player-info">
                        <div className="player-info--icon">
                          <FontAwesomeIcon icon={icon} className="info--icon-i" />
                          {player.rank === 1 && (
                            <div className="info--icon-crown">
                              <FontAwesomeIcon icon={faCrown} className="icon-crown-i" />
                            </div>
                          )}
                        </div>
                        <h4>{player.name}</h4>
                      </div>

                      {/* Player score and dropdown icon */}
                      <div className="item-player-dropdown">
                        <p>{player.score} Points</p>
                        {isOpen ? <FontAwesomeIcon icon={faChevronUp} className="item-player-dropdown-i" /> : <FontAwesomeIcon icon={faChevronDown} className="item-player-dropdown-i" />}
                      </div>
                    </div>
                  </div>

                  {/* Player score breakdown slideout */}
                  {isOpen && (
                    <div className="slideout-inline">
                      <h4>{player.name}’s Score Breakdown</h4>
                      <div className="slideout-entries">
                        {getDisplayableDetails(player.details).map((entry, idx) => (
                          <div className="entry" key={idx}>
                            <span>{entry.label}</span>
                            <span id="points">
                              {entry.value >= 0 ? '+' : '-'}
                              {Math.abs(entry.value)} Points
                            </span>
                          </div>
                        ))}
                        <div className="entry total">
                          <h2>Total Score</h2>
                          <p>{player.score} Points</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tie note */}
          {hasTies && (
            <div className="tiebreaker-note">
              <FontAwesomeIcon icon={faTriangleExclamation} className="tiebreaker-note-i" />
              <p>Some players are tied. Refer to official game tiebreaker rules if needed.</p>
            </div>
          )}

          {/* Leave button */}
          <div className="lobby__main-btns">
            <button
              className="btn cancel-btn"
              onClick={() => navigate('/')}
            >
              Leave
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;