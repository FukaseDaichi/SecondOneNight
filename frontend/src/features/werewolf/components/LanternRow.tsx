import React from 'react';
import styles from '../../../styles/components/werewolf/lantern.module.scss';

type Props = {
    count: number;
    max: number;
    min: number;
};

// 入室人数プログレスを兼ねた提灯列。min 人に達すると列全体が揺れて開始可能を合図
export default function LanternRow({ count, max, min }: Props) {
    const ready = count >= min;
    return (
        <div
            className={`${styles.row} ${ready ? styles.ready : ''}`}
            role="status"
            aria-label={`参加 ${count} / ${max} 人`}
        >
            {Array.from({ length: max }, (_, i) => (
                <span
                    key={i}
                    className={`${styles.lantern} ${
                        i < count ? styles.lit : ''
                    }`}
                    style={{ animationDelay: `${i * 0.12}s` }}
                ></span>
            ))}
            <span className={styles.caption}>
                {ready ? '開始できます' : `あと${min - count}人で開始できます`}
            </span>
        </div>
    );
}
