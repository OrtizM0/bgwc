// ticket-to-ride.js
// Configuration object defining input fields for the "Ticket to Ride" board game.
// Each field specifies a key (used for data tracking), label (UI display), icon (FontAwesome), and validation rule.

import {
  faFlagCheckered,
  faRoute,
  faTicketSimple
} from '@fortawesome/free-solid-svg-icons';

// Validation helpers
// Accepts only whole numbers (no decimals or negatives)
const integerOnly = (val) => /^[0-9]+$/.test(val);

// Accepts both positive and negative integers (useful for ticket that are not completed)
const allowNegative = (val) => /^-?[0-9]+$/.test(val);

// Export configuration for Ticket to Ride
export default {
  title: 'Ticket to Ride',
  
  // Input fields for score entry
  fields: [
    {
      key: 'totalPoints',
      label: 'Final Score',
      icon: faFlagCheckered,
      validate: integerOnly // Only whole numbers allowed
    },
    {
      key: 'longestRoute',
      label: 'Longest Route Length',
      icon: faRoute,
      validate: integerOnly // Only whole numbers allowed
    },
    {
      key: 'destinationTicket',
      label: 'Destination Ticket',
      icon: faTicketSimple,
      repeatable: true,       // Allows multiple entries (some tickets can be negative)
      validate: allowNegative // Accepts negative values for failed tickets
    }
  ]
};