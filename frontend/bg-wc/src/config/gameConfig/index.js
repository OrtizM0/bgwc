// gameConfig/index.js
// Central registry mapping game identifiers to their respective configuration modules.
// Each imported module defines the scoring logic, player setup, and UI behavior for its game.

import sheriff from './sheriff-of-nottingham';
import wingspan from './wingspan';
import ticketToRide from './ticket-to-ride';

// Map or supported games to their configuration objects
// (Each imported config file should export an object defining the game's structure)
export const gameConfigMap = {
  'sheriff-of-nottingham': sheriff,
  'wingspan': wingspan,
  'ticket-to-ride': ticketToRide
};