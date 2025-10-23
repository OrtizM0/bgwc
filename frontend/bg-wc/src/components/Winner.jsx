// Winner.jsx
// Displays a winner animation after game completion
// Loops through all players briefly before revealing the actual winner, complete with confetti celebration.

import './Winner.css';
import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import confetti from 'canvas-confetti';
import { iconOptions } from './PlayerSelect';

function Winner({ gameTitle, winnerName, winnerIcon, players }) {
  // State
  const [showFinal, setShowFinal] = useState(false);    // Controls when the final winner is shown
  const [currentIndex, setCurrentIndex] = useState(0);  // Index for looping through players
  const intervalRef = useRef(null);                     // Reference to the interval timer

  // Configurable timing
  const animationDuration = 3000; // Time (ms) until the real winner is revealed
  const intervalSpeed = 100;      // How fast names/icons cycle before reveal

  // Find winner index (if present)
  const winnerIndex = players.findIndex(p => p.name === winnerName);

  // Cycle through players then reveal winner
  useEffect(() => {
    if (!players || players.length === 0) return;

    // Start cycling through player names/icons
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % players.length);
    }, intervalSpeed);

    // Stop cycling and show the winner after animationDuration
    const stopAt = setTimeout(() => {
      clearInterval(intervalRef.current);
      setCurrentIndex(winnerIndex);
      setShowFinal(true);

      // Confetti effect
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, animationDuration);

    // Cleanup on unmount or re-render
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(stopAt);
    };
  }, [players, winnerName]);

  // Resolve current displayed player
  const current = players[currentIndex] || {};
  const iconObj = iconOptions.find(icon => icon.iconName === current.icon) || iconOptions[0];

  return (
    <div className={`winner ${showFinal ? 'show-winner' : ''}`}>
      <h2>{gameTitle}</h2>
      <div className="winner__info">
        <h1>{showFinal ? 'Winner' : 'Calculating...'}</h1>
        <div className="winner__info-container">
          <div className="winner__info-container--icon">
            <FontAwesomeIcon icon={iconObj} className="container--icon-i" />
          </div>
          <h3>{current.name || '???'}</h3>
        </div>
      </div>
    </div>
  );
}

export default Winner;