import React from 'react';
import styles from '../../../styles/components/werewolf/statuscard.module.scss';

type Props = {
    count: number;
    max: number;
    min: number;
    ready: boolean;
    messages: string[];
    onStart: () => void;
};

// 開始ステータスカード: 蝋燭の灯で入室人数を示し、開始可否と GAME START を1枚にまとめる
export default function StatusCard({
    count,
    max,
    min,
    ready,
    messages,
    onStart,
}: Props) {
    return (
        <section
            className={styles.card}
            role="status"
            aria-label={`参加 ${count} / ${max} 人`}
        >
            <div className={styles.candleRow}>
                <span
                    className={`${styles.bigCandle} ${
                        count >= min ? styles.lit : ''
                    }`}
                    aria-hidden="true"
                ></span>
                <div className={styles.candleField}>
                    <div className={styles.candles} aria-hidden="true">
                        {Array.from({ length: max }, (_, i) => (
                            <span
                                key={i}
                                className={`${styles.candle} ${
                                    i < count ? styles.lit : ''
                                }`}
                                style={{ animationDelay: `${i * 0.12}s` }}
                            ></span>
                        ))}
                    </div>
                    <p className={styles.caption}>
                        {count >= min
                            ? '開始できます'
                            : `あと${min - count}人で開始できます`}
                    </p>
                </div>
            </div>
            <p className={styles.countText}>
                現在 <strong>{count}</strong> 人が入室中(
                {min}〜{max}人で開始できます)
            </p>
            <button
                className={styles.start}
                onClick={onStart}
                disabled={!ready}
                title={!ready ? messages.join(' / ') : undefined}
            >
                GAME START
            </button>
        </section>
    );
}
