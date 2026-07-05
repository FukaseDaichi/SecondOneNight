import React from 'react';
import styles from '../../../styles/components/werewolf/verdict.module.scss';
import { WerewolfUser } from '../../../type/werewolf';
import { isDeadUser, victoryTeam } from '../victory';
import DeadMarker from './DeadMarker';

type Props = {
    winMessage: string;
    winteamList: number[];
    userList: Array<WerewolfUser>;
};

// 第2幕: 勝敗発表。陣営バナー1文字ずつ+勝者前出し。死亡者マーカー維持
export default function VerdictAct({
    winMessage,
    winteamList,
    userList,
}: Props) {
    const team = victoryTeam(winteamList);
    const chars = Array.from(`${winMessage}の勝利`);
    const winners = userList.filter(
        (u) => !!u.roll && winteamList.includes(u.roll.teamNo)
    );
    const losers = userList.filter(
        (u) => !u.roll || !winteamList.includes(u.roll.teamNo)
    );
    const card = (u: WerewolfUser, winner: boolean) => (
        <li
            key={u.userNo}
            className={`${styles.card} ${winner ? styles.winner : styles.loser} ${
                isDeadUser(u) ? styles.dead : ''
            }`}
        >
            <span className={styles.name}>{u.userName}</span>
            <span className={styles.roll}>{u.roll?.name ?? 'なし'}</span>
            {isDeadUser(u) && <DeadMarker />}
        </li>
    );
    return (
        <div className={`${styles.act} ${styles[team]}`}>
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
            <ul className={styles.winnerRow}>
                {winners.map((u) => card(u, true))}
            </ul>
            <ul className={styles.loserRow}>
                {losers.map((u) => card(u, false))}
            </ul>
            <p className={styles.hint}>タップで結果へ</p>
        </div>
    );
}
