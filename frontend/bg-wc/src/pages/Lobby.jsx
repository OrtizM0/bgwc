// Lobby.jsx
// Handles the game lobby where players wait before starting a game.
// Allows copying room code, viewing rules, starting the game (host), and kicking players.

import './Lobby.css';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmarkCircle,
  faCheck,
  faArrowUpRightFromSquare,
  faClone,
  faCrown
} from '@fortawesome/free-solid-svg-icons';
import { iconOptions } from '../components/PlayerSelect';
import socket from '../socket';

// Format game key into title case
function formatGameTitle(gameKey) {
  const lowercaseWords = ['of', 'to', 'the', 'and', 'in', 'for', 'on', 'with', 'at', 'by', 'from'];
  return gameKey
    .split('-')
    .map((word, i) => {
      const lower = word.toLowerCase();
      if (i === 0 || !lowercaseWords.includes(lower)) {
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      } else {
        return lower;
      }
    })
    .join(' ');
}

function Lobby() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { player, game, role } = location.state || {};

  const [players, setPlayers] = useState([]);   // List of current players in lobby
  const [copied, setCopied] = useState(false);  // Clipboard feedback
  const joinedRef = useRef(false);              // Ensure join-room only emits once

  // Handle lobby updates and joining
  useEffect(() => {
    const handleUpdate = ({ players, game }) => {
      // Remove duplicate players (by sockedId)
      const uniquePlayers = players.filter(
        (player, index, self) =>
          index === self.findIndex(p => p.socketId === player.socketId)
      );
      setPlayers(uniquePlayers);
    };

    // Only join room once
    if (!joinedRef.current) {
      socket.emit('join-room', { room: roomCode, player, game, role });
      joinedRef.current = true;
    }

    // Listen for lobby updates and kicks
    socket.on('update-lobby', handleUpdate);
    socket.on('kicked', () => {
      navigate('/?kicked=true');
    });

    return () => {
      socket.off('update-lobby', handleUpdate);
      socket.off('kicked');
    };
  }, [roomCode, navigate, player, game, role]);

  // Listen for game start
  useEffect(() => {
    socket.on('game-started', ({ player, game }) => {
      navigate(`/game/${roomCode}`, {
        state: { player, game },
      });
    });

    return () => {
      socket.off('game-started');
    };
  }, [roomCode, navigate]);

  // Host starts the game
  const handleStartGame = () => {
    if (players.length < 2) {
      alert("You need at least 2 players to start the game.");
      return;
    }

    socket.emit('start-game', { room: roomCode, player, game });
  };

  // Copy room code to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  // Kick a player (host only)
  const handleKick = (socketIdToKick) => {
    socket.emit('kick-player', { room: roomCode, socketIdToKick });
  };

  return (
    <div className="container">
      <div className="lobby">
        <h1>{formatGameTitle(game)}</h1>
        <div className="lobby__main">

          {/* Header: Room code + Rules */}
          <div className="lobby__main-header">
            <div className="lobby__main-header--code">
              <h3>{roomCode}</h3>
              <button
                onClick={handleCopy}
                className={`copy-btn ${copied ? 'copied' : ''}`}
                title="Copy room code"
              >
                <FontAwesomeIcon icon={copied ? faCheck : faClone} className="header--code-i" />
              </button>
            </div>
            <button
              onClick={() => {
                const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
                window.open(`${BACKEND_URL}/rulebooks/${game}.pdf`, '_blank');
              }}
              title="View game rules"
            >
              Rules <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="header-i" />
            </button>
          </div>
          
          {/* Player List */}
          <div className="lobby__main-list">
            {players.map((p) => (
              <div className="lobby__main-list--player" key={p.socketId}>
                <div className="list--player-info">
                  <div className="player-info--icon">
                    <FontAwesomeIcon icon={iconOptions.find(icon => icon.iconName === p.icon)} className="info--icon-i" />
                  </div>
                  <h4>{p.name}</h4>
                  {/* Crown icon for host */}
                  {p.id === players[0]?.id && (
                    <FontAwesomeIcon icon={faCrown} className="player-info-i" />
                  )}
                </div>

                {/* Kick icon visible only to host, cannot kick self */}
                {socket.id === players[0]?.socketId && p.socketId !== socket.id && (
                  <FontAwesomeIcon
                    icon={faXmarkCircle}
                    className="list--player-i"
                    onClick={() => handleKick(p.socketId)}
                    title="Kick player"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Footer Buttons */}
          <div className="lobby__main-btns">
            {/* Host can start the game */}
            {socket.id === players[0]?.socketId && (
              <button className="btn submit-btn" onClick={handleStartGame}>Start</button>
            )}
            {/* Leave button for all players */}
            <button
              className="btn cancel-btn"
              onClick={() => {
                socket.emit('leave-room', { room: roomCode, playerId: player?.id });

                // Cleanup localStorage
                if (player?.id && game) {
                  localStorage.removeItem(`cards-${game}-${player.id}`);
                  localStorage.removeItem(`isReady-${game}-${player.id}`);
                }

                if (roomCode) {
                  localStorage.removeItem(`winner-${roomCode}`);
                }

                localStorage.removeItem('bgwc-session');
                localStorage.removeItem('bgwc-phase');

                navigate('/');
              }}
            >
              Leave
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Lobby;