import React from 'react';
import styles from '../../../styles/components/werewolf/verdict.module.scss';
import { victoryTeam } from '../victory';

type Props = {
    winMessage: string;
    winteamList: number[];
    // result 中は上部に縮小して残す
    compact?: boolean;
};

// 勝敗バナー: 種明かしの盤面の上に「〇〇の勝利」を1文字ずつ重ねる
export default function VerdictBanner({
    winMessage,
    winteamList,
    compact = false,
}: Props) {
    const team = victoryTeam(winteamList);
    const chars = Array.from(`${winMessage}の勝利`);
    return (
        <div
            className={`${styles.act} ${styles[team]} ${
                compact ? styles.compact : ''
            }`}
        >
            <p className={styles.banner} role="status">
                {chars.map((ch, i) => (
                    <span
                        key={i}
                        className={styles.char}
                        style={{ animationDelay: `${0.2 + i * 0.14}s` }}
                    >
                        {ch}
                    </span>
                ))}
            </p>
            {!compact && <p className={styles.hint}>タップで結果へ</p>}
        </div>
    );
}
