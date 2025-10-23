// Game.jsx
// Core gameplay screen
// Handles input collection, validation, readiness, and winner detection for any supported game.

import './Game.css';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faSquareCheck } from '@fortawesome/free-solid-svg-icons';
import { useGesture } from '@use-gesture/react';
import { iconOptions } from '../components/PlayerSelect';
import { gameConfigMap } from '../config/gameConfig';
import socket from '../socket';
import Winner from '../components/Winner';

function Game() {
  // Route and state setup
  const location = useLocation();
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const { game, player } = location.state || {};
  const config = gameConfigMap[game]; // Fetch the scoring configuration for this game

  // State Variables
  const [inputValue, setInputValue] = useState('');
  const [cards, setCards] = useState([]);                         // List of score entries
  const [editingIndex, setEditingIndex] = useState(null);         // Index of card being edited
  const [mainIndex, setMainIndex] = useState(null);               // Index of current visible card
  const [fieldStep, setFieldStep] = useState(0);                  // Current input field index from config
  const [isReady, setIsReady] = useState(false);                  // Whether player has finished entering scores
  const [winnerData, setWinnerData] = useState(null);             // Winner info once game finishes
  const [animateMainCard, setAnimateMainCard] = useState(false);  // Animation flag

  // LocalStorage keys (unique per game/player)
  const cardsKey = `cards-${game}-${player?.id}`;
  const readyKey = `isReady-${game}-${player?.id}`;

  // Initial validation
  useEffect(() => {
    // Redirect to home if accessed without valid game/player state
    if (!player || !game) navigate('/');
  }, [player, game, navigate]);

  // Restore local progress
  useEffect(() => {
    const stored = localStorage.getItem(cardsKey);
    const wasReady = localStorage.getItem(readyKey) === 'true';

    if (stored && stored !== '[]') {
      try {
        const parsed = JSON.parse(stored);
        setCards(parsed);
        setMainIndex(parsed.length - 1);

        // Determine which field comes next
        const keysPresent = parsed.map(card => card.key);
        const nextField = config.fields.find(f => !f.repeatable && !keysPresent.includes(f.key));
        setFieldStep(nextField ? config.fields.findIndex(f => f.key === nextField.key) : 0);
        setIsReady(wasReady);
      } catch (e) {
        console.warn('Failed to parse localStorage cards:', e);
      }
    }
  }, [cardsKey, readyKey, config.fields]);

  // Sync cards to localStorage
  useEffect(() => {
    localStorage.setItem(cardsKey, JSON.stringify(cards));
  }, [cards]);

  // Socket sync: ready status
  useEffect(() => {
    if (!player?.id || !roomCode) return;

    if (isReady) {
      localStorage.setItem(readyKey, 'true');
      if (cards.length > 0) {
        // Notify server that this player is ready
        socket.emit('player-ready', {
          room: roomCode,
          playerId: player.id,
          playerName: player.name,
          cards,
        });
      }
    } else {
      localStorage.removeItem(readyKey);
      socket.emit('player-not-ready', {
        room: roomCode,
        playerId: player.id,
      });
    }
  }, [isReady, player?.id, roomCode, cards]);

  // Handle winner phase
  useEffect(() => {
    const storedWinner = localStorage.getItem(`winner-${roomCode}`);
    
    if (storedWinner) {
      // Skip calculation animation if winner already known
      const parsed = JSON.parse(storedWinner);
      localStorage.setItem('bgwc-phase', 'winner');
      setWinnerData(parsed);

      setTimeout(() => {
        navigate(`/leaderboard/${roomCode}`, { state: parsed });
      }, 4000);
    } else {
      socket.emit('get-game-result', { room: roomCode });
    }

    // When server announces result
    const handleGameResult = (data) => {
      const winnerPayload = {
        name: data.winnerName,
        icon: data.winnerIcon || 'ghost',
        score: data.score,
        message: data.message,
        gameTitle: config?.title || game,
        players: data.players,
        hasTies: data.hasTies,
        room: roomCode,
        player: player
      };

      // Cleanup and persist
      localStorage.removeItem(cardsKey);
      localStorage.removeItem(readyKey);
      localStorage.removeItem(`bgwc-phase`);
      localStorage.setItem(`winner-${roomCode}`, JSON.stringify(winnerPayload));
      setWinnerData(winnerPayload);

      // Transition to leaderboard
      setTimeout(() => {
        navigate(`/leaderboard/${roomCode}`, { state: winnerPayload });
      }, 4000);
    };

    socket.on('game-result', handleGameResult);
    return () => socket.off('game-result', handleGameResult);
  }, [roomCode, navigate]);

  // Swipe gesture handling
  const bind = useGesture({
    onDragEnd: ({ swipe: [swipeX] }) => {
      if (swipeX === 0 || cards.length < 2) return;
      setMainIndex((prev) => {
        const nextIndex = swipeX === -1 ? prev + 1 : prev - 1;
        return Math.max(0, Math.min(cards.length - 1, nextIndex));
      });
    },
  });

  // Cleanup on exit
  useEffect(() => {
    return () => {
      if (player?.id && game) {
        localStorage.removeItem(`cards-${game}-${player.id}`);
        localStorage.removeItem(`isReady-${game}-${player.id}`);
      }

      if (roomCode) {
        localStorage.removeItem(`winner-${roomCode}`);
      }

      localStorage.removeItem('bgwc-phase');
    };
  }, []);

  // Handle input submission
  const handleSubmit = () => {
    const currentField = config.fields[fieldStep];
    const value = inputValue.trim();

    // Validation check
    if (currentField.validate && !currentField.validate(value)) {
      alert('❗ Please enter a valid score.');
      return;
    }

    if (!value) return;

    const newCard = {
      key: currentField.key,
      label: currentField.label,
      icon: currentField.icon,
      value,
    };

    // Edit existing card or create new one
    if (editingIndex !== null) {
      const updated = [...cards];
      updated[editingIndex] = newCard;
      setCards(updated);
      setEditingIndex(null);
      setMainIndex(editingIndex);
    } else {
      if (!currentField.repeatable && cards.some(c => c.key === currentField.key)) return;
      setCards(prev => [...prev, newCard]);
      setMainIndex(cards.length);
      setAnimateMainCard(true);
      setTimeout(() => setAnimateMainCard(false), 400);
    }

    // Check if all required fields filled
    const keysPresent = [...cards.map(c => c.key), currentField.key];
    const allFilled = config.fields
      .filter(f => !f.repeatable)
      .every(f => keysPresent.includes(f.key));
    const hasRepeatables = config.fields.some(f => f.repeatable);

    // Advance to next step or mark ready
    if (!currentField.repeatable) {
      if (allFilled) {
        if (!hasRepeatables) {
          setIsReady(true);
        } else {
          setFieldStep(config.fields.findIndex(f => f.repeatable) || 0);
        }
      } else {
        const nextField = config.fields.find(f => !f.repeatable && !keysPresent.includes(f.key));
        if (nextField) {
          setFieldStep(config.fields.findIndex(f => f.key === nextField.key));
        }
      }
    }

    setInputValue('');
  };

  // Card layout logic
  const getCardClass = (index) => {
    const offset = index - mainIndex;
    switch (offset) {
      case 0: return 'main';
      case -1: return 'l-inner';
      case -2: return 'l-outer';
      case 1: return 'r-inner';
      case 2: return 'r-outer';
      default: return 'hidden';
    }
  };

  // Player and field lookups
  const playerIcon = iconOptions.find(icon => icon.iconName === player?.icon) || iconOptions[0];
  const currentField = config?.fields?.[fieldStep];

  // Conditional rendering
  if (!player || !config) return null;

  // Winner screen
  if (winnerData) {
    return (
      <div className="container">
        <Winner
          gameTitle={winnerData.gameTitle}
          winnerName={winnerData.name}
          winnerIcon={winnerData.icon}
          players={winnerData.players}
        />
      </div>
    );
  }

  // Main game UI
  return (
    <div className="container">
      <div className="game">
        <h1>{config?.title || 'Game'}</h1>

        <div className="game__container">
          {/* Player Display */}
          <div className="game__container-player">
            <div className="game__container-player--icon">
              <FontAwesomeIcon icon={playerIcon} className="player--icon-i" />
            </div>
            <h2>{player?.name}</h2>
          </div>

          {/* Input Form */}
          {!isReady && currentField && (
            <div className="game__container-input">
              <div className="game__container-input--icon">
                <FontAwesomeIcon icon={currentField.icon} className="input--icon-i" />
                <h6>{currentField.label}</h6>
              </div>
              <input
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button className="submit-btn" onClick={handleSubmit}>
                {editingIndex !== null ? 'Update' : 'Submit'}
              </button>

              {currentField.repeatable && cards.some(c => c.key === currentField.key) && (
                <button className="submit-btn" onClick={() => setIsReady(true)}>
                  I’m Done
                </button>
              )}
            </div>
          )}

          {/* Ready Banner */}
          {isReady && (
            <div className="ready-banner">
              <FontAwesomeIcon icon={faSquareCheck} className="ready-banner-i" />
              <h6>You're marked as ready!</h6>
              <p>(Click on cards to edit your scores)</p>
            </div>
          )}

          {/* Score Cards Carousel */}
          {cards.length > 0 && (
            <>
            {/* Navigation Buttons */}
              <div className="carousel-controls">
                <button
                  className="carousel-btn"
                  onClick={() => setMainIndex((prev) => Math.max(0, prev - 1))}
                  disabled={mainIndex === 0}
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="carousel-controls-i" />
                </button>
                <button
                  className="carousel-btn"
                  onClick={() => setMainIndex((prev) => Math.min(cards.length - 1, prev + 1))}
                  disabled={mainIndex === cards.length - 1}
                >
                  <FontAwesomeIcon icon={faChevronRight} className="carousel-controls-i" />
                </button>
              </div>

              {/* Card Carousel */}
              <div className="game__container-cards" {...bind()} style={{ touchAction: 'none' }}>
                {cards.map((card, i) => {
                  const cardClass = getCardClass(i);
                  if (cardClass === 'hidden') return null;
                  return (
                    <div
                      key={i}
                      className={`game__container-cards--card ${cardClass}${i === mainIndex && animateMainCard ? ' animate-in' : ''}`}
                      onClick={() => {
                        if (i !== mainIndex) {
                          setMainIndex(i);
                          return;
                        }
                        setInputValue(card.value);
                        setEditingIndex(i);
                        setFieldStep(config.fields.findIndex(f => f.key === card.key));
                        setIsReady(false);
                      }}
                    >
                      <div className="card-overlay" />
                      <div className="cards--card-input">
                        <FontAwesomeIcon icon={card.icon} className="card-input-i" />
                        <h6>{card.label}</h6>
                      </div>
                      <h2>{card.value}</h2>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Game;