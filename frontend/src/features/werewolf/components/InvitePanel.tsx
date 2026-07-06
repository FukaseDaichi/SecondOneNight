import React, { useState } from 'react';
import styles from '../../../styles/components/werewolf/invite.module.scss';

type Props = {
    roomId: string;
    roomCode: string | null;
    onShowRule: () => void;
};

// 招待カード: ルーム番号と URL コピー。右側にヒーロー画像を敷く
export default function InvitePanel({ roomId, roomCode, onShowRule }: Props) {
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
        <section className={styles.invite} aria-label="なかまを招く">
            <img
                className={styles.hero}
                src="/images/hero.webp"
                alt=""
                aria-hidden="true"
            />
            <div className={styles.body}>
                <p className={styles.eyebrow}>INVITE</p>
                <h2 className={styles.title}>なかまを招く</h2>
                {roomCode && (
                    <p className={styles.codeRow}>
                        <span className={styles.codeLabel}>ルーム番号</span>
                        <span className={styles.code}>{roomCode}</span>
                    </p>
                )}
                <div className={styles.actions}>
                    <button className={styles.copy} onClick={copyUrl}>
                        {copied ? 'コピーしました' : '部屋のURLをコピー'}
                    </button>
                    <button className={styles.rule} onClick={onShowRule}>
                        遊び方
                    </button>
                </div>
            </div>
        </section>
    );
}
