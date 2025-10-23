// PlayerSelect.jsx
// This component allows players to choose an icon, enter their name, and either host or join a game room.
// It handles both "host" and "join" modes, performs room validation via socket events, and emits player info upward.

import { useState } from 'react'
import './PlayerSelect.css'
import socket from '../socket'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faCaretLeft,
    faCaretRight,
    faGhost,
    faHatWizard,
    faHatCowboy,
    faTrophy,
    faChessKnight,
    faCat,
    faRobot,
    faUserAstronaut,
    faDog,
    faDragon,
    faHippo,
    faFrog,
    faOtter,
    faRocket,
    faSkull,
    faFireFlameCurved,
    faBolt,
    faShieldHalved,
    faWandSparkles,
    faUserNinja,
    faUserSecret,
    faMoon,
    faTruckMonster,
    faYinYang,
    faTractor,
    faSpider,
    faSpaghettiMonsterFlying,
    faSnowman,
    faPoop,
    faCircleRadiation,
    faPizzaSlice,
    faPaw,
    faMeteor,
    faJetFighter,
    faIceCream,
    faHorse,
    faHotdog,
    faClover,
    faBurger,
    faBiohazard
} from '@fortawesome/free-solid-svg-icons'

// Array of all available player icon options.
// Each icon adds a bit of personality to a player's in-game avatar.
export const iconOptions = [
    faUserNinja,
    faUserSecret,
    faUserAstronaut,

    faHatWizard,
    faWandSparkles,
    faSkull,
    faFireFlameCurved,
    faBolt,
    faShieldHalved,
    faGhost,
    faDragon,
    faHatCowboy,

    faCat,
    faDog,
    faFrog,
    faHippo,
    faOtter,
    faHorse,

    faRobot,
    faRocket,
    faMeteor,
    faJetFighter,

    faTrophy,
    faChessKnight,

    faMoon,
    faYinYang,
    faCircleRadiation,
    faBiohazard,

    faTruckMonster,
    faTractor,
    faSpider,
    faSpaghettiMonsterFlying,
    faSnowman,

    faPizzaSlice,
    faHotdog,
    faBurger,
    faIceCream,
    faPoop,
    faClover,
    faPaw,
];

function PlayerSelect({ mode, game, onSubmit }) {
    // Local State
    const [iconIndex, setIconIndex] = useState(0);
    const [username, setUsername] = useState('');
    const [roomCode, setRoomCode] = useState('');

    // Icon Selection Handlers
    const handleLeft = () => {
        setIconIndex((prev) => (prev === 0 ? iconOptions.length - 1 : prev - 1));
    };

    const handleRight = () => {
        setIconIndex((prev) => (prev === iconOptions.length - 1 ? 0 : prev + 1));
    };

    // Submit Handler
    const handleSubmit = () => {
        if (!username.trim()) {
            alert('❗ Please enter a username.');
            return;
        }

        const trimmedRoom = roomCode.trim().toUpperCase();

        // Handle "Join" mode - validate room code and ensure the game matches.
        if (mode === 'join') {
            if (!trimmedRoom || trimmedRoom.length !== 4) {
                alert('❗ Please enter a valid 4-letter room code.');
                return;
            }

            socket.emit('check-room', { roomCode: trimmedRoom, game }, (res) => {
                if (!res.exists) {
                    alert('❌ No room found with that code.');
                    return;
                }

                if (res.gameMismatch) {
                    alert('⚠️ That room exists, but it is for a different game.');
                    return;
                }

                submitJoin(trimmedRoom);
            });
        } else {
            // Handle "Host" mode - generate a new random room code.
            const newRoom = generateRoomCode();
            submitJoin(newRoom);
        }
    };

    // Emit join data to parent
    const submitJoin = (room) => {
        onSubmit({
            id: socket.id,
            name: username,
            icon: iconOptions[iconIndex],
            room,
            game,
            role: mode
        });
    };

    // Generate a random 4-character room code
    const generateRoomCode = () => {
        return Math.random().toString(36).substring(2, 6).toUpperCase();
    };

    return (
        <div className="player-select">
            {/* Icon carousel */}
            <div className="player-select__icon-container">
                <FontAwesomeIcon icon={faCaretLeft} className="player-select-i" onClick={handleLeft} />
                <div className="icon-container">
                    <FontAwesomeIcon icon={iconOptions[iconIndex]} className="player-icon-i" />
                </div>
                <FontAwesomeIcon icon={faCaretRight} className="player-select-i" onClick={handleRight} />
            </div>

            {/* Username and (optional) room code input */}
            <div className="inputs-container">
                <div className="inputs">
                    <label htmlFor="username">Enter your name</label>
                    <input
                        name="username"
                        id="username"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                {/* Room code input only shown in "join" mode */}
                {mode === 'join' && (
                    <div className="inputs">
                        <label htmlFor="room">Enter the room code</label>
                        <input
                            name="room"
                            id="room"
                            placeholder="86WC"
                            maxLength={4}
                            value={roomCode}
                            onChange={(e) => {
                                const input = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                setRoomCode(input.slice(0, 4));
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Action button */}
            <div className="btns">
                <button className="main-btn" onClick={handleSubmit}>
                    {mode === 'join' ? 'Join' : 'Start Game'}
                </button>
            </div>
        </div>
    );
}

export default PlayerSelect