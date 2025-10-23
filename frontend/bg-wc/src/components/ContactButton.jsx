// ContactButton.jsx
// Floating suggestion button for submitting board game suggestions or updates
// Displays animated hover text and modal form

import './ContactButton.css';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faXmark } from '@fortawesome/free-solid-svg-icons';

// Words to cycle through on hover
const wordList = ['Suggestions', 'Updates', 'Board Games'];

function ContactButton() {
  // Modal and form state
  const [showModal, setShowModal] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Hover animation state
  const [hovered, setHovered] = useState(false);
  const [displayText, setDisplayText] = useState('Suggestions');
  const [charIndex, setCharIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [typingForward, setTypingForward] = useState(true);

  // Typing animation effect
  useEffect(() => {
    if (!hovered) {
      setDisplayText('Suggestions');
      setCharIndex(0);
      setWordIndex(0);
      setTypingForward(true);
      return;
    }

    const currentWord = wordList[wordIndex];
    const typingInterval = setInterval(() => {
      if (typingForward) {
        if (charIndex < currentWord.length) {
          setDisplayText(currentWord.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTypingForward(false);
        }
      } else {
        if (charIndex > 0) {
          setDisplayText(currentWord.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setTypingForward(true);
          setWordIndex((wordIndex + 1) % wordList.length);
        }
      }
    }, 80);

    return () => clearInterval(typingInterval);
  }, [hovered, charIndex, wordIndex, typingForward]);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Submit suggestion to backend
  const handleSend = async () => {
    if (!suggestion.trim()) {
      alert('Please enter a suggestion!');
      return;
    }

    try {
      await fetch(`${BACKEND_URL}/api/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestion, email }),
      });
      setSubmitted(true);
    } catch (error) {
      alert('Failed to send suggestion.');
    }
  };

  return (
    <>
      <div className="contact-button" 
        onClick={() => setShowModal(true)}
        onMouseEnter={() => {
          setHovered(true);
          setDisplayText('');
          setCharIndex(0);
          setTypingForward(true);
        }}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="contact-button__content">
          <FontAwesomeIcon icon={faComment} className="contact-button__content-i" />
          {hovered && <h2>{displayText}</h2>}
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {submitted ? (
              <div className="thanks">Thanks for your suggestion!</div>
            ) : (
              <>
                <div className="modal-header">
                    <h3>Suggest a Board Game or Update</h3>
                    <FontAwesomeIcon icon={faXmark} className="modal-header-i" onClick={() => setShowModal(false)}/>
                </div>
                <textarea
                  placeholder="What game should we add?"
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                />
                <input
                  type="email"
                  placeholder="(Optional) Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button className="submit-btn" onClick={handleSend}>Send</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ContactButton;