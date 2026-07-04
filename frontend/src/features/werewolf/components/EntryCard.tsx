import React, { useState } from 'react';
import styles from '../../../styles/components/werewolf/entry.module.scss';

type Props = {
    connected: boolean;
    entered: boolean;
    onRoomIn: (userName: string) => void;
};

export default function EntryCard({ connected, entered, onRoomIn }: Props) {
    const [name, setName] = useState('');

    if (entered) {
        return null;
    }

    return (
        <div className={styles.entry}>
            <div className={styles.card}>
                <p className={styles.eyebrow}>SECOND ONE NIGHT WEREWOLF</p>
                <h1 className={styles.title}>村への入り口</h1>
                <p className={styles.lead}>
                    名前を入れて入室してください。
                    <br />
                    全員そろったら、ゲームを始めましょう。
                </p>
                <div className={styles.field}>
                    <label htmlFor="username">NAME</label>
                    <input
                        disabled={!connected}
                        type="text"
                        id="username"
                        maxLength={20}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onRoomIn(name);
                            }
                        }}
                    />
                </div>
                <button
                    className={styles.submit}
                    disabled={!connected}
                    onClick={() => onRoomIn(name)}
                >
                    入室する
                </button>
                {!connected && (
                    <p className={styles.connecting}>
                        サーバーに接続しています…(初回は数十秒かかることがあります)
                    </p>
                )}
            </div>
        </div>
    );
}
