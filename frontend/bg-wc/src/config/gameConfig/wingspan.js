// wingspan.js
// Configuration object defining input fields for the "Wingspan" board game.
// Each field specifies a key (used for data tracking), label (UI display), icon (FontAwesome), and validation rule.

import {
  faDove,
  faEgg,
  faFileCirclePlus,
  faFlagCheckered,
  faLayerGroup,
  faWheatAwn
} from '@fortawesome/free-solid-svg-icons';

// Allows only whole numbers (no decimals or letters)
const integerOnly = (val) => /^[0-9]+$/.test(val);

// Export configuration for Wingspan
export default {
  title: 'Wingspan',

  // Input fields representing Wingspan scoring components
  fields: [
    { key: 'birds', label: 'Birds', icon: faDove, validate: integerOnly },
    { key: 'bonusCards', label: 'Bonus Cards', icon: faFileCirclePlus, validate: integerOnly },
    { key: 'endOfRoundGoals', label: 'End-of-Round Goals', icon: faFlagCheckered, validate: integerOnly },
    { key: 'eggs', label: 'Eggs', icon: faEgg, validate: integerOnly },
    { key: 'foodOnCards', label: 'Food on Cards', icon: faWheatAwn, validate: integerOnly },
    { key: 'tuckedCards', label: 'Tucked Cards', icon: faLayerGroup, validate: integerOnly }
  ]
};