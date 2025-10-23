# 🧩 How to Add a New Board Game

Follow these steps to fully integrate a new board game into the app:

---

## 🗂️ 1. Add to the `<select>` Dropdown on the Home Screen

**File:** `Home.jsx`

### 🔧 Edit:

```jsx
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
  <option value="your-game-key">Your Game Title</option> {/* ✅ Add this */}
</select>
```

- `value`: Must be kebab-case and **match everywhere** (e.g., `my-new-game`)
- Display text: This is what players see (e.g., `My New Game`)

---

## ⚙️ 2. Create a Game Config Entry

**File:** `src/config/gameConfig.js` (if not yet created, make this)

### Example:

```js
import { faAppleWhole, faFish, faDice } from '@fortawesome/free-solid-svg-icons';

export const gameConfigMap = {
  'sheriff-of-nottingham': { ... },
  'wingspan': { ... },
  'ticket-to-ride': { ... },
  'my-new-game': {
    title: 'My New Game',
    fields: [
      {
        key: 'resourceA',
        label: 'Resource A',
        icon: faAppleWhole
      },
      {
        key: 'resourceB',
        label: 'Resource B',
        icon: faFish
      },
      {
        key: 'diceScore',
        label: 'Dice Score',
        icon: faDice
      }
    ]
  }
};
```

- `key`: Unique ID per field (used for localStorage & syncing)
- `label`: What players see
- `icon`: FontAwesome icon

---

## 🧠 3. Backend Logic for Scoring (Optional)

**File:** `backend/scoringRules.js`

### Example:

```js
module.exports = {
  calculateScores: (gameKey, players) => {
    if (gameKey === 'my-new-game') {
      return players.map(player => {
        const score = Number(player.inputs.resourceA || 0) + Number(player.inputs.diceScore || 0);
        return {
          ...player,
          totalScore: score
        };
      });
    }

    // other games...
  }
};
```

- Handle undefined fields
- Return `totalScore` for sorting

---

## 📚 4. Add Rulebook PDF (Optional)

Place file here:

```bash
backend/public/rulebooks/my-new-game.pdf
```

Will be available in Lobby via Rules button.

---

## 🎨 5. Icon Consistency

Use FontAwesome icons. Add to `gameConfig.js` only. Add to `iconOptions` in `PlayerSelect.jsx` if needed.

---

## ✅ 6. Test Everything

- [ ] Dropdown
- [ ] Join/Host flow
- [ ] Input fields
- [ ] Ready state
- [ ] Score calculation
- [ ] Confetti/Winner display
- [ ] Refresh behavior

---

## 🧪 Sample Config

```js
'castle-crusaders': {
  title: 'Castle Crusaders',
  fields: [
    { key: 'knights', label: 'Knights', icon: faChessKnight },
    { key: 'gold', label: 'Gold Collected', icon: faCoins },
    { key: 'battles', label: 'Battles Won', icon: faShieldHalved }
  ]
}
```

---

Keep `key`s lowercase, avoid spaces, and keep config synced between frontend & backend.

---

## 📋 7. Score Breakdown Display Rules

When rendering score breakdowns on the Leaderboard, the app **hides informational labels** that are not actual point contributors (e.g., route lengths or stats that don't award points directly).

To customize this behavior, edit:

**File:** `Leaderboard.jsx`

### Helper:

```js
const NON_SCORING_LABELS = ['Longest Route Length'];

const getDisplayableDetails = (details = []) => {
  return details.filter(entry => !NON_SCORING_LABELS.includes(entry.label));
};