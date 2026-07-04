import React, { useState } from 'react';
import styles from '../../../styles/components/werewolf/entry.module.scss';

type Props = {
    roomId: string;
    roomCode: string | null;
};

export default function InvitePanel({ roomId, roomCode }: Props) {
    const [copied, setCopied] = useState(false);
    const roomUrl =
        typeof window !== 'undefined'
            ? `${location.origin}/werewolf/${roomId}`
            : '';

    const copyUrl = async () => {
        try {
            await navigator.clipboard.writeText(roomUrl);
            setCopied(true);
        } catch {
            // クリップボード非対応時は何もしない(URL はアドレスバーから共有可能)
        }
    };

    return (
        <div className={styles.invite}>
            <p className={styles.inviteLabel}>INVITE ─ なかまを招く</p>
            {roomCode && <p className={styles.code}>{roomCode}</p>}
            <div className={styles.inviteActions}>
                <button onClick={copyUrl}>
                    {copied ? 'コピーしました' : '部屋のURLをコピー'}
                </button>
            </div>
        </div>
    );
}
