// server.js
// Main backend server for Board Game Winner Calculator (BGWC)
// Handles rooms, real-time gamplay via Socket.IO, scoring, and suggestion submissions

require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
const scoringRules = require('./scoringRules');
const suggestionRoutes = require('./routes/suggestions');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);

// Enable CORS for frontend client
app.use(cors({
  origin: CLIENT_URL,
  methods: ['GET', 'POST'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Routes
app.use(suggestionRoutes); // /api/suggestions
app.use('/rulebooks', express.static(path.join(__dirname, 'public/rulebooks')));

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

// In-memory room storage: { ROOM_CODE: { game, stage, players, submissions } }
const rooms = {};

/**
 * Calculates player ranks, handling ties
 * @param {Array} players - Array of player score objects
 * @returns {Object} { rankedPlayers: Array, hasTies: boolean }
 */
function calculateRanksWithTies(players) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const ranked = [];
  let currentRank = 1;
  let lastScore = null;

  sorted.forEach((player, index) => {
    if (player.score !== lastScore) currentRank = index + 1;
    ranked.push({ ...player, rank: currentRank });
    lastScore = player.score;
  });

  const scoreCount = {};
  ranked.forEach(p => {
    scoreCount[p.score] = (scoreCount[p.score] || 0) + 1;
  });
  const hasTies = Object.values(scoreCount).some(count => count > 1);

  return { rankedPlayers: ranked, hasTies };
}

// Socket.IO connection
io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  // Check if room exists and matches game
  socket.on('check-room', ({ roomCode, game }, callback) => {
    if (!rooms[roomCode]) {
      callback({ exists: false });
    } else if (rooms[roomCode].game !== game) {
      callback({ exists: true, gameMismatch: true });
    } else {
      callback({ exists: true, gameMismatch: false });
    }
  });

  // Player joins rorom
  socket.on('join-room', ({ room, player, game, role }) => {
    // Create room if host
    if (role === 'host' && !rooms[room]) {
      rooms[room] = {
        game,
        stage: 'lobby',
        players: [],
        submissions: {}
      };
      console.log(`Room ${room} created with game ${game}`);
    }

    if (!rooms[room]) {
      socket.emit('room-not-found');
      return;
    }

    // Add or update player in room
    const alreadyInRoom = rooms[room].players.find(p => p.id === player.id);
    if (!alreadyInRoom) {
      const newPlayer = { ...player, socketId: socket.id };
      rooms[room].players.push(newPlayer);
    } else {
      alreadyInRoom.socketId = socket.id;
    }

    socket.join(room);
    io.to(room).emit('update-lobby', {
      players: rooms[room].players,
      game: rooms[room].game
    });
  });

  // Player leaves room
  socket.on('leave-room', ({ room, playerId }) => {
    if (!rooms[room]) return;

    rooms[room].players = rooms[room].players.filter(p => p.id !== playerId);
    delete rooms[room].submissions[playerId];
    socket.leave(room);

    if (rooms[room].players.length === 0) {
      delete rooms[room];
      console.log(`Room ${room} deleted after last player left`);
    } else {
      io.to(room).emit('update-lobby', {
        players: rooms[room].players,
        game: rooms[room].game
      });
    }
  });

  // Kick a player
  socket.on('kick-player', ({ room, socketIdToKick }) => {
    if (!rooms[room]) return;
    rooms[room].players = rooms[room].players.filter(p => p.socketId !== socketIdToKick);
    io.to(socketIdToKick).emit('kicked');
    io.to(room).emit('update-lobby', {
      players: rooms[room].players,
      game: rooms[room].game
    });
    console.log(`Player ${socketIdToKick} was kicked from room ${room}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    for (const room in rooms) {
      const roomData = rooms[room];
      const index = roomData.players.findIndex(p => p.socketId === socket.id);

      if (index !== -1) {
        roomData.players.splice(index, 1);

        const playerId = roomData.players[index]?.id;
        if (playerId && roomData.submissions[playerId]) {
          delete roomData.submissions[playerId];
        }

        if (roomData.players.length === 0) {
          delete rooms[room];
          console.log(`Room ${room} deleted on disconnect`);
        } else {
          io.to(room).emit('update-lobby', {
            players: roomData.players,
            game: roomData.game
          });
        }
      }
    }
  });

  // Get room data
  socket.on('get-room-data', ({ room }) => {
    const roomData = rooms[room];
    if (roomData) {
      socket.emit('room-data', {
        players: roomData.players,
        game: roomData.game
      });
    }
  });

  // Start game
  socket.on('start-game', ({ room }) => {
    const roomData = rooms[room];
    if (!roomData || roomData.players.length < 2) {
      io.to(socket.id).emit('start-error', {
        message: 'At least 2 players are required to start the game.'
      });
      return;
    }

    roomData.stage = 'input';
    roomData.players.forEach(p => {
      io.to(p.socketId).emit('game-started', {
        player: p,
        game: roomData.game
      });
    });

    console.log(`Game started in room ${room}`);
  });

  // Playerr submits readiness and cards
  socket.on('player-ready', ({ room, playerId, playerName, cards }) => {
    const roomData = rooms[room];
    if (!roomData) return;

    const playerMeta = roomData.players.find(p => p.id === playerId);
    if (!playerMeta) return;

    roomData.submissions[playerId] = {
      name: playerName,
      icon: playerMeta.icon || 'ghost',
      cards
    };

    const playerCount = roomData.players.length;
    const submittedCount = Object.keys(roomData.submissions).length;

    const allReady = playerCount > 0 &&
      submittedCount >= playerCount &&
      roomData.players.every(p => roomData.submissions[p.id]);

    if (!allReady) {
      console.log(`All ready? false (${submittedCount}/${playerCount})`);
      return;
    }

    console.log(`All players ready in room ${room}, calculating winner...`);

    // Compute scores
    let results;
    const ruleFn = scoringRules[roomData.game];
    if (typeof ruleFn === 'function') {
      results = ruleFn(roomData.submissions);
    } else {
      results = Object.entries(roomData.submissions).map(([id, data]) => ({
        id,
        name: data.name,
        icon: data.icon,
        score: data.cards.reduce((sum, c) => sum + parseInt(c.value || 0), 0),
        details: data.cards.map(c => ({
          label: c.label || c.key,
          value: parseInt(c.value || 0, 10)
        }))
      }));
    }

    const { rankedPlayers, hasTies } = calculateRanksWithTies(results);
    const winner = rankedPlayers[0];

    roomData.stage = 'leaderboard';
    roomData.result = {
      winnerName: winner.name,
      winnerIcon: winner.icon,
      score: winner.score,
      players: rankedPlayers,
      hasTies,
      game: roomData.game
    };

    io.to(room).emit('game-result', roomData.result);
    console.log(`Emitting game-result for ${winner.name}`);

    // Schedule cleanup
    if (!roomData.cleanupScheduled) {
      roomData.cleanupScheduled = true;
      setTimeout(() => {
        if (rooms[room]) {
          delete rooms[room];
          console.log(`Room ${room} deleted after game result`);
        }
      }, 120000);
    }

    roomData.resultTimestamp = Date.now();
  });

  // Fetch game result
  socket.on('get-game-result', ({ room }) => {
    const roomData = rooms[room];
    if (roomData?.result) {
      socket.emit('game-result', roomData.result);

      if (!roomData.cleanupScheduled) {
        roomData.cleanupScheduled = true;
        setTimeout(() => {
          if (rooms[room]) {
            delete rooms[room];
            console.log(`Room ${room} deleted after late result recovery`);
          }
        }, 120000);
      }
    }
  });

  // Player marks not ready
  socket.on('player-not-ready', ({ room, playerId }) => {
    const roomData = rooms[room];
    if (roomData?.submissions[playerId]) {
      delete roomData.submissions[playerId];
      console.log(`${playerId} marked not ready in room ${room}`);
    }
  });
});

// Test route
app.get('/', (req, res) => {
  res.send('BGWC backend is running');
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});