import React from 'react';
import styles from '../../../styles/components/werewolf/start.module.scss';

const TITLE = '投票時間';

export default function VotingStart() {
    return (
        <div className={`${styles.start} ${styles.voting}`} aria-hidden="true">
            <div className={styles.moon}></div>
            <div className={styles.ring}></div>
            <div className={styles.inner}>
                <p className={styles.eyebrow}>VOTING</p>
                <p className={styles.title}>
                    {TITLE.split('').map((char, index) => (
                        <span
                            key={index}
                            className={styles.char}
                            style={{ animationDelay: `${0.4 + index * 0.12}s` }}
                        >
                            {char}
                        </span>
                    ))}
                </p>
            </div>
        </div>
    );
}
