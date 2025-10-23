// Home.jsx
// Main landing page for the board game web app.
// Handles game selection, session restoration, room joining, and redirection to Game or Leaderboard screens.

import './Home.css'
import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PlayerSelect from '../components/PlayerSelect'
import socket from '../socket'
import ContactButton from '../components/ContactButton'

function Home() {
  // Route and navigation
  const location = useLocation();
  const navigate = useNavigate();

  // State Variables
  const [mode, setMode] = useState(null);                     // 'host' or 'join'
  const [selectedGame, setSelectedGame] = useState('');       // Currently selected board game
  const [view, setView] = useState('home');                   // UI view: 'home' or 'select'
  const [kickedMessage, setKickedMessage] = useState(false);  // Show bannerr if kicked

  // Initial load and session restoration
  useEffect(() => {
    // Clean up and lingering localStorage data from previous games
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cards-') || key.startsWith('isReady-') || key.startsWith('winner-')) {
        localStorage.removeItem(key);
      }
    });

    // Handle kicked user scenario
    const params = new URLSearchParams(location.search);
    const kicked = params.get('kicked') === 'true';

    if (kicked) {
      setKickedMessage(true);
      setMode(null);
      setSelectedGame('');
      setView('home');

      // Remove 'kicked' from query params
      const cleaned = new URLSearchParams(location.search);
      cleaned.delete('kicked');
      navigate({ search: cleaned.toString() }, { replace: true });

      // Clear session storage
      localStorage.removeItem('bgwc-session');
      localStorage.removeItem('bgwc-phase');
      return;
    }

    // Restore session if exists
    const stored = localStorage.getItem('bgwc-session');
    const phase = localStorage.getItem('bgwc-phase');

    if (stored && phase) {
      const { room, player, game, role } = JSON.parse(stored);
      socket.emit('join-room', { room, player, game, role }); // Rejoin socket room

      // Redirect based on last phase
      if (phase === 'input' || phase === 'winner') {
        localStorage.setItem('bgwc-phase', 'input');
        navigate(`/game/${room}`, {
          state: { player, game },
          replace: true,
        });
      } else if (phase === 'leaderboard') {
        localStorage.setItem('bgwc-phase', 'leaderboard');
        navigate(`/room/${room}/leaderboard`, {
          state: { player, game },
          replace: true,
        });
      }
    } else {
      // Clear session if invalid
      localStorage.removeItem('bgwc-session');
      localStorage.removeItem('bgwc-phase');
    }
  }, [location, navigate]);

  // Handle mode selection (Host / Join)
  const handleModeSelect = (selectedMode) => {
    if (!selectedGame) {
      alert('Please select a game first.');
      return;
    }
    setMode(selectedMode);
    setView('select');
  };

  // Handle player submission
  const handlePlayerSubmit = (data) => {
    const session = {
      room: data.room,
      player: {
        id: socket.id,
        name: data.name,
        icon: data.icon.iconName,
      },
      game: data.game,
      role: data.role,
    };

    // Join the socket room
    socket.emit('join-room', {
      ...session,
    });

    // Persist session to localStorage
    localStorage.setItem('bgwc-session', JSON.stringify(session));
    localStorage.setItem('bgwc-phase', 'input');

    // Navigate to room screen
    navigate(`/room/${data.room}`, {
      state: session,
    });
  };

  return (
    <div className="container">
      {/* Kicked User Banner */}
      {kickedMessage && (
        <div className="kicked-banner">
          You were removed from the room.
        </div>
      )}

      {/* Home View: Game Selection + Host/Join */}
      {view === 'home' && (
        <>
            <div className="home">
              <select
                name="board-games"
                id="board-games"
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
              >
                <option value="" disabled>Select your board game</option>
                <option value="sheriff-of-nottingham">Sheriff of Nottingham</option>
                <option value="wingspan">Wingspan</option>
                <option value="ticket-to-ride">Ticket to Ride</option>
              </select>
              <div className="btns">
                <button className="main-btn" onClick={() => handleModeSelect('host')}>Host</button>
                <button className="main-btn" onClick={() => handleModeSelect('join')}>Join</button>
              </div>
            </div>
        </>
      )}

      {/* Player Selection View */}
      {view === 'select' && (
        <PlayerSelect
          mode={mode}
          game={selectedGame}
          onSubmit={handlePlayerSubmit}
        />
      )}
      
      {/* Contact / Support Button */}
      <ContactButton />
    </div>
  );
}

export default Home