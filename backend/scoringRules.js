// ScoringRules.js
// Calculates player scores for multiple boarrd games
// Supported games: Ticket to Ride, Wingspan, Sheriff of Nottingham

/** 
 * Default score calculation (used for Wingspan)
 * Sums up all card values for each player
 */
function defaultSum(players) {
  return Object.entries(players).map(([playerId, { name, icon, cards }]) => {
    const total = cards.reduce((sum, card) => sum + parseInt(card.value || 0), 0);
    return {
      id: playerId,
      name,
      icon,
      score: total,
      details: cards.map(c => ({
        label: c.label || c.key,
        value: parseInt(c.value || 0, 10)
      }))
    };
  });
}

/**
 * Calculate scores for Sheriff of Nottingham
 * Considers:
 * - Basic item points
 * - Royal item points
 * - King/Queen bonuses (with tie handling)
 */
function calculateSheriffScores(players) {
  const itemPoints = {
    gold: 1,
    apples: 2,
    bread: 3,
    cheese: 3,
    chicken: 4,
    crossbow: 9,
    mead: 7,
    pepper: 6,
    silk: 8,
    goldenApples: 6,
    greenApples: 4,
    pumpernickelBread: 9,
    ryeBread: 6,
    bleuCheese: 9,
    goudaCheese: 6,
    royalRooster: 8
  };

  const kingQueenBonuses = {
    apples: { king: 20, queen: 10 },
    bread: { king: 15, queen: 10 },
    cheese: { king: 15, queen: 10 },
    chicken: { king: 10, queen: 5 }
  };

  const royalKeys = [
    'goldenApples',
    'greenApples',
    'pumpernickelBread',
    'ryeBread',
    'bleuCheese',
    'goudaCheese',
    'royalRooster'
  ];

  const playerScores = {};
  const legalCounts = {};

  for (const [playerId, { name, icon, cards }] of Object.entries(players)) {
    let score = 0;
    const countMap = {};

    // Count cards
    for (const { key, value } of cards) {
      const count = parseInt(value || '0', 10);
      if (!countMap[key]) countMap[key] = 0;
      countMap[key] += count;

      if (!royalKeys.includes(key)) {
        const unitValue = itemPoints[key] || 0;
        score += count * unitValue;
      }
    }

    // Add royal item points
    score += (countMap['goldenApples'] || 0) * 6;
    score += (countMap['greenApples'] || 0) * 4;
    score += (countMap['pumpernickelBread'] || 0) * 9;
    score += (countMap['ryeBread'] || 0) * 6;
    score += (countMap['bleuCheese'] || 0) * 9;
    score += (countMap['goudaCheese'] || 0) * 6;
    score += (countMap['royalRooster'] || 0) * 8;

    // Compute King/Queen bonuses
    for (const good of Object.keys(kingQueenBonuses)) {
      const base = countMap[good] || 0;
      let royalBonus = 0;

      if (good === 'apples') {
        royalBonus += 2 * (countMap['goldenApples'] || 0);
        royalBonus += 2 * (countMap['greenApples'] || 0);
      } else if (good === 'bread') {
        royalBonus += 2 * (countMap['pumpernickelBread'] || 0);
        royalBonus += 2 * (countMap['ryeBread'] || 0);
      } else if (good === 'cheese') {
        royalBonus += 2 * (countMap['bleuCheese'] || 0);
        royalBonus += 2 * (countMap['goudaCheese'] || 0);
      } else if (good === 'chicken') {
        royalBonus += 2 * (countMap['royalRooster'] || 0);
      }

      const totalCount = base + royalBonus;

      if (!legalCounts[good]) legalCounts[good] = {};
      legalCounts[good][playerId] = totalCount;
    }

    playerScores[playerId] = {
      id: playerId,
      name,
      icon,
      rawScore: score,
      bonus: 0,
      titles: []
    };
  }

  // Apply King/Queen bonus distribution
  for (const [good, counts] of Object.entries(legalCounts)) {
    const bonus = kingQueenBonuses[good];

    const maxTotalCount = Math.max(...Object.values(counts));
    if (maxTotalCount === 0) continue;

    const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
    const topCount = sorted[0][1];
    const topPlayers = sorted.filter(([, count]) => count === topCount);

    if (topPlayers.length > 1) {
      // Share points if tie
      const shared = Math.floor((bonus.king + bonus.queen) / topPlayers.length);
      for (const [pid] of topPlayers) {
        playerScores[pid].bonus += shared;
        playerScores[pid].titles.push({ label: `Shared ${good} King/Queen`, value: shared });
      }
    } else {
      const kingId = sorted[0][0];
      playerScores[kingId].bonus += bonus.king;
      playerScores[kingId].titles.push({ label: ` ${good} King`, value: bonus.king });

      const secondCount = sorted.find(([, count]) => count < topCount)?.[1];
      const queenPlayers = sorted.filter(([, count]) => count === secondCount);

      if (queenPlayers.length > 0 && secondCount > 0) {
        const sharedQueen = Math.floor(bonus.queen / queenPlayers.length);
        for (const [pid] of queenPlayers) {
          playerScores[pid].bonus += sharedQueen;
          playerScores[pid].titles.push({ label: `${good} Queen`, value: sharedQueen });
        }
      }
    }
  }

  // Prepare final output with detailed breakdown
  return Object.values(playerScores).map(p => {
    const details = [];

    const countMap = players[p.id].cards.reduce((acc, card) => {
      acc[card.key] = (acc[card.key] || 0) + parseInt(card.value || '0', 10);
      return acc;
    }, {});

    for (const [key, count] of Object.entries(countMap)) {
      const label = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
      const value = (itemPoints[key] || 0) * count;
      if (value > 0) details.push({ label, value });
    }

    for (const { label, value } of p.titles) {
      details.push({ label, value });
    }

    return {
      id: p.id,
      name: p.name,
      icon: p.icon,
      score: p.rawScore + p.bonus,
      details
    };
  });
}

/**
 * Calculate scores for Ticket to Ride
 * - Adds totalPoints from cards
 * - Adds destination ticket points
 * - Gives bonus for longest route
 */
function calculateTicketToRideScores(players) {
  const playerScores = {};
  const longestByPlayer = {};

  for (const [playerId, { name, icon, cards }] of Object.entries(players)) {
    if (!Array.isArray(cards)) continue;

    let score = 0;
    let longestRoute = 0;

    for (const { key, value } of cards) {
      const val = parseInt(value || '0', 10);
      if (key === 'totalPoints') {
        score += val;
      } else if (key === 'longestRoute') {
        longestRoute = val;
      } else if ((key.startsWith('destinationTicket') || key.startsWith('destinationTicket-'))) {
        score += val;
      }
    }

    playerScores[playerId] = {
      id: playerId,
      name,
      icon,
      rawScore: score,
      bonus: 0,
      longest: longestRoute
    };

    longestByPlayer[playerId] = longestRoute;
  }

  // Apply Longest Route bonus
  const maxLength = Math.max(...Object.values(longestByPlayer));
  const tiedPlayers = Object.entries(longestByPlayer)
    .filter(([, length]) => length === maxLength)
    .map(([id]) => id);

  for (const pid of tiedPlayers) {
    playerScores[pid].bonus += 10;
  }

  // Prepare final output
  return Object.values(playerScores).map(p => {
    const details = [];
    const player = players[p.id];

    for (const { key, value } of player.cards) {
      const val = parseInt(value || '0', 10);
      if (val === 0) continue;

      if (key === 'totalPoints') {
        details.push({ label: 'Final Score', value: val });
      } else if (key === 'longestRoute') {
        details.push({ label: 'Longest Route Length', value: val });
      } else if (key.startsWith('destinationTicket')) {
        details.push({ label: 'Destination Ticket', value: val });
      }
    }

    if (p.bonus > 0) {
      details.push({
        label: `Longest Route Bonus (${p.longest})`,
        value: p.bonus
      });
    }

    return {
      id: p.id,
      name: p.name,
      icon: p.icon,
      score: p.rawScore + p.bonus,
      details
    };
  });
}

// Export scoring functions per game
module.exports = {
  'ticket-to-ride': calculateTicketToRideScores,
  'wingspan': defaultSum,
  'sheriff-of-nottingham': calculateSheriffScores
};