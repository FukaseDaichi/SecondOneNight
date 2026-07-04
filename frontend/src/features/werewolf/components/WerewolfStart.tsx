import React from 'react';
import styles from '../../../styles/components/werewolf/start.module.scss';

const TITLE = ['夜', 'が', '、', 'お', 'と', 'ず', 'れ', 'る', '。'];

export default function WerewolfStart() {
    return (
        <div className={styles.start} aria-hidden="true">
            <div className={styles.moon}></div>
            <div className={styles.ring}></div>
            <div className={styles.inner}>
                <p className={styles.eyebrow}>SECOND ONE NIGHT ─ GAME START</p>
                <p className={styles.title}>
                    {TITLE.map((ch, i) => (
                        <span
                            key={i}
                            className={styles.char}
                            style={{ animationDelay: `${0.5 + i * 0.13}s` }}
                        >
                            {ch}
                        </span>
                    ))}
                </p>
            </div>
        </div>
    );
}
