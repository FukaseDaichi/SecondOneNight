import { useState } from 'react';

type Props = {
    connected: boolean;
    entered: boolean;
    onRoomIn: (userName: string) => void;
    className: string; // 各ゲームの styles.roominbtn
    enteredClassName: string; // 各ゲームの styles.in
};

export default function RoomInForm({
    connected,
    entered,
    onRoomIn,
    className,
    enteredClassName,
}: Props) {
    const [name, setName] = useState('');
    return (
        <div className={`${className} ${entered ? enteredClassName : ''}`}>
            <p>
                <label htmlFor="username">Name</label>
            </p>
            <input
                disabled={!connected}
                type="text"
                id="username"
                maxLength={20}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => {
                    if (e.key == 'Enter') {
                        e.preventDefault();
                        onRoomIn(name);
                    }
                }}
            />
            <button disabled={!connected} onClick={() => onRoomIn(name)}>
                Room IN
            </button>
        </div>
    );
}
