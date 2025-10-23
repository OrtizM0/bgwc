// FloatingBackground.jsx
// Animated background component that randomly positions and animates board-game themed SVG icons.
// Used for subtle, dynamic visual effect throughout the app.

import './FloatingBackground.css'

// Import all floating SVG assets
import battleshipPiece from '../assets/background-pieces/battleship-piece.svg';
import catanRobber from '../assets/background-pieces/catan-robber.svg';
import cityPiece from '../assets/background-pieces/city-piece.svg';
import clubSuit from '../assets/background-pieces/club-suit.svg';
import d20 from '../assets/background-pieces/d20.svg';
import diamondSuit from '../assets/background-pieces/diamond-suit.svg';
import die1 from '../assets/background-pieces/die-1.svg';
import die2 from '../assets/background-pieces/die-2.svg';
import die3 from '../assets/background-pieces/die-3.svg';
import die4 from '../assets/background-pieces/die-4.svg';
import die5 from '../assets/background-pieces/die-5.svg';
import die6 from '../assets/background-pieces/die-6.svg';
import domino from '../assets/background-pieces/domino.svg';
import goldCoin from '../assets/background-pieces/gold-coin.svg';
import knightPiece from '../assets/background-pieces/knight-piece.svg';
import meeple from '../assets/background-pieces/meeple.svg';
import monopolyCar from '../assets/background-pieces/monopoly-car.svg';
import monopolyDog from '../assets/background-pieces/monopoly-dog.svg';
import pokerChip from '../assets/background-pieces/poker-chip.svg';
import puzzlePiece from '../assets/background-pieces/puzzle-piece.svg';
import rookPiece from '../assets/background-pieces/rook-piece.svg';
import scrabbleA from '../assets/background-pieces/scrabble-a.svg';
import scrabbleC from '../assets/background-pieces/scrabble-c.svg';
import sorryPiece from '../assets/background-pieces/sorry-piece.svg';
import trainPiece from '../assets/background-pieces/train-piece.svg';
import wingspanEgg from '../assets/background-pieces/wingspan-egg.svg';
import wingspanFish from '../assets/background-pieces/wingspan-fish.svg';
import wingspanWorm from '../assets/background-pieces/wingspan-worm.svg';

// Collection of all assets to float on the background
const floatAssets = [
  battleshipPiece, catanRobber, cityPiece, clubSuit, d20,
  diamondSuit, die1, die2, die3, die4, die5, die6,
  domino, goldCoin, knightPiece, meeple,
  monopolyCar, monopolyDog, pokerChip,
  puzzlePiece, rookPiece,
  scrabbleA, scrabbleC,
  sorryPiece, trainPiece,
  wingspanEgg, wingspanFish, wingspanWorm,
];

function FloatingBackground() {
  // Different motion styles defined in the CSS
  const motions = ['floatVertical', 'floatHorizontal', 'floatDiagonal'];

  return (
    <div className="floating-bg">
      {floatAssets.map((asset, index) => {
        // Generate random positioning and animation properties for each asset
        const top = Math.random() * 100;        // Vertical position (percentage)
        const left = Math.random() * 100;       // Horizontal position (percentage)
        const size = 30 + Math.random() * 40;   // Size in pixels
        const duration = 6 + Math.random() * 4; // Animation duration in seconds
        const delay = Math.random() * 8;        // Animation delay in seconds
        const motion = motions[Math.floor(Math.random() * motions.length)]; // Random motion type

        return (
          <img
            key={index}
            src={asset}
            alt="floating piece"
            className={`float ${motion}`}
            style={{
              top: `${top}%`,
              left: `${left}%`,
              width: `${size}px`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}

export default FloatingBackground;