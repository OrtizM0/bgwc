// App.jsx
// Handles routing and session-based redirects.

import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';

import Home from './pages/Home.jsx';
import Lobby from './pages/Lobby.jsx';
import Game from './pages/Game.jsx';
import Leaderboard from './pages/Leaderboard.jsx';

import Logo from './components/Logo.jsx';
import FloatingBackground from './components/FloatingBackground.jsx';

import './App.css';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Handle session-based redirects on initial load
  useEffect(() => {
    const isInitial = location.pathname === '/';  // Only redirect if starting at home

    if (!isInitial) return;

    const session = localStorage.getItem('bgwc-session');
    const phase = localStorage.getItem('bgwc-phase');

    if (!session || !phase) return; // No session, do nothing

    try {
      const { room, player, game } = JSON.parse(session);

      if (!room || !player || !game) throw new Error('Invalid session');

      // Redirect based on last known phase
      if (phase === 'input' || phase === 'winner') {
        navigate(`/game/${room}`, {
          state: { player, game },
          replace: true
        });
      } else if (phase === 'leaderboard') {
        navigate(`/leaderboard/${room}`, {
          state: { player, game },
          replace: true
        });
      }
    } catch (err) {
      console.warn('Invalid session data, clearing...');
      // Clean up corrupted session data
      localStorage.removeItem('bgwc-session');
      localStorage.removeItem('bgwc-phase');
    }
  }, [navigate, location]);

  return (
    <>
      {/* Floating background animation for visual effect */}
      <FloatingBackground />

      {/* Main container */}
      <div className="main-content">
        {/* App Logo */}
        <Logo />

        {/* Routing */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomCode" element={<Lobby />} />
          <Route path="/game/:roomCode" element={<Game />} />
          <Route path="/leaderboard/:roomCode" element={<Leaderboard />} />
        </Routes>
      </div>
    </>
  );
}

export default App;