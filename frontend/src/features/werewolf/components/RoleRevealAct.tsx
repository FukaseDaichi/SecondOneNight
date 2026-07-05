import React, { useEffect, useMemo, useState } from 'react';
import styles from '../../../styles/components/werewolf/rolereveal.module.scss';
import { WerewolfUser } from '../../../type/werewolf';
import { isDeadUser, revealOrder } from '../victory';
import DeadMarker from './DeadMarker';

type Props = {
    userList: Array<WerewolfUser>;
    npcuser: WerewolfUser | null;
    onDone: () => void;
};

const REVEAL_INTERVAL_MS = 1100;
const DONE_DELAY_MS = 1500;

// 第1幕: 種明かし。人狼系を最後に1枚ずつ役職開示。死亡者マーカーは開示と同時に表示
export default function RoleRevealAct({ userList, npcuser, onDone }: Props) {
    const ordered = useMemo(() => {
        const list = npcuser?.roll ? [...userList, npcuser] : userList;
        return revealOrder(list);
    }, [userList, npcuser]);
    const [revealed, setRevealed] = useState(0);
    const allRevealed = revealed >= ordered.length;

    useEffect(() => {
        const id = window.setTimeout(
            allRevealed ? onDone : () => setRevealed((n) => n + 1),
            allRevealed ? DONE_DELAY_MS : REVEAL_INTERVAL_MS
        );
        return () => window.clearTimeout(id);
    }, [revealed, allRevealed, onDone]);

    return (
        <div
            className={styles.act}
            onClick={() => setRevealed((n) => Math.min(n + 1, ordered.length))}
        >
            <p className={styles.heading}>─ 種明かし ─</p>
            <ul className={styles.grid}>
                {ordered.map((u, i) => {
                    const open = i < revealed;
                    return (
                        <li
                            key={`${u.userNo}-${u.userName}`}
                            className={`${styles.card} ${
                                open ? styles.open : ''
                            } ${open && isDeadUser(u) ? styles.dead : ''}`}
                        >
                            <span className={styles.name}>{u.userName}</span>
                            <span className={styles.face}>
                                {open ? (u.roll?.name ?? 'なし') : '？'}
                            </span>
                            {open && (
                                <span className={styles.voteTo}>
                                    → {u.votingUserName || '─'}
                                </span>
                            )}
                            {open && isDeadUser(u) && <DeadMarker />}
                        </li>
                    );
                })}
            </ul>
            <p className={styles.hint}>タップで次へ</p>
        </div>
    );
}
