// sheriff-of-nottingham.js
// Configuration object defining input fields for the "Sheriff of Nottingham" game.
// Each field specifies a key (used for data tracking), label (UI display), icon (FontAwesome), and validation rule.

// FontAwesome icons for field visualization
import {
  faAppleWhole,
  faKiwiBird,
  faCoins,
  faBreadSlice,
  faCheese,
  faWhiskeyGlass,
  faBullseye,
  faMortarPestle,
  faRibbon
} from '@fortawesome/free-solid-svg-icons';

// Allows only whole numbers (no decimals or letters)
const integerOnly = (val) => /^[0-9]+$/.test(val);

// Export configuration for the Sheriff of Nottingham game
export default {
  title: 'Sheriff of Nottingham',

  // List of fields displayed to players for entering their game results
  fields: [
    // Base goods
    { key: 'gold', label: 'Total Gold', icon: faCoins, validate: integerOnly },
    { key: 'apples', label: 'Apples Count', icon: faAppleWhole, validate: integerOnly },
    { key: 'bread', label: 'Bread Count', icon: faBreadSlice, validate: integerOnly },
    { key: 'cheese', label: 'Cheese Count', icon: faCheese, validate: integerOnly },
    { key: 'chicken', label: 'Chicken Count', icon: faKiwiBird, validate: integerOnly },

    // Contraband goods
    { key: 'crossbow', label: 'Crossbow Count', icon: faBullseye, validate: integerOnly },
    { key: 'mead', label: 'Mead Count', icon: faWhiskeyGlass, validate: integerOnly },
    { key: 'pepper', label: 'Pepper Count', icon: faMortarPestle, validate: integerOnly },
    { key: 'silk', label: 'Silk Count', icon: faRibbon, validate: integerOnly },

    // Special goods
    { key: 'goldenApples', label: 'Golden Apples Count', icon: faAppleWhole, validate: integerOnly },
    { key: 'greenApples', label: 'Green Apples Count', icon: faAppleWhole, validate: integerOnly },
    { key: 'pumpernickelBread', label: 'Pumpernickel Bread Count', icon: faBreadSlice, validate: integerOnly },
    { key: 'ryeBread', label: 'Rye Bread Count', icon: faBreadSlice, validate: integerOnly },
    { key: 'bleuCheese', label: 'Bleu Cheese Count', icon: faCheese, validate: integerOnly },
    { key: 'goudaCheese', label: 'Gouda Cheese Count', icon: faCheese, validate: integerOnly },
    { key: 'royalRooster', label: 'Royal Rooster Count', icon: faKiwiBird, validate: integerOnly }
  ]
};