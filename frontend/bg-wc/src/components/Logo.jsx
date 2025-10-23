// Logo.jsx
// Displays the app logo along with a random tagline (quip) under it.
// The quip is chosen on render and does not change during the session until refreshed.

import { useMemo } from 'react';
import './Logo.css'
import bgwcLogo from '../assets/bgwc-logo.svg'

function Logo() {
    // List of randmoized "quips" shown beneath the logo.
    const quips = [
        "Now in 4D!",
        "End the debate, pick a winner!",
        "Faster than a rules lawyer",
        "Trust the math, not your memory",
        "Because everyone *thinks* they won",
        "Like a referee, but geekier",
        "Perfect for sore winners",
        "Because ties are for necks",
        "All’s fair in love and board games",
        "For those who can't count points",
        "Do you know da wae?",
        "Now with 87% more snark!",
        "Board game math, but sexy",
        "Certified winner validator",
        "More consistent than Chad",
        "Because friendship is fragile",
        "Math says you're wrong",
        "Shhh… the calculator decided",
        "Your ego may not recover",
        "Designed by sore losers for sore losers",
        "The end-of-game therapist",
        "100% salt extraction guaranteed",
        "Powered by caffeine and resentment",
        "Results non negotiable",
        "Now featuring passive-aggression!",
        "Math: the real MVP",
        "We counted. Twice.",
        "Bringing peace to game night… maybe",
        "Better than rock-paper-scissors",
        "Calculates faster than Kyle complains",
        "When winning matters *too* much",
        "Warning: may destroy friendships",
        "Proof you were right all along",
        "Built on logic. Fueled by drama",
        "Caution: May cause arguments",
        "Built different",
        "Brain not included",
        "99% accurate, 1% sass",
        "Let chaos reign",
        "Yes, this is serious",
        "Told you so",
        "As seen in your dreams",
        "Just trust it",
        "Does this spark joy?",
        "Also works underwater. Probably.",
        "Probably haunted",
        "Some assembly required",
        "Beta-tested by raccoons",
        "Slightly judgmental",
        "Laugh now, crash out later",
        "Still better than arguing",
        "It knows what you did",
        "Not liable for hurt feelings",
        "This line was randomly selected",
        "You didn't read the rules anyway",
        "Bro thinks he won",
        "Skill issue detected",
        "This aged like milk",
        "0% skill. 100% luck.",
        "Math says no",
        "Live Laugh Lose",
        "Your mom uses this too",
        "Now with less dignity",
        "Powered by pettiness",
        "Hot take: you're not winning",
        "Built to cause beef.",
        "L + didn’t read the rules",
        "Trust the process. or don’t.",
        "He do be counting tho",
        "She do be counting tho",
        "Red flag detected",
        "Your ego ends here",
        "Emotional damage",
        "Certified hood classic",
        "Winner POV",
        "This game is sponsored by salt.",
        "Press F to calculate",
        "User error. Always.",
    ];

    // Randomly select one quip to display when the component first renders.
    const selectedQuip = useMemo(() => {
        const index = Math.floor(Math.random() * quips.length);
        return quips[index];
    }, []);

    return(
        <div className="logo">
            <img src={bgwcLogo} alt="Board Game Winner Calculator Logo" />
            <h3>{selectedQuip}</h3>
        </div>
    );
}

export default Logo