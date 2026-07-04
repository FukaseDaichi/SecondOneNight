import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from '../../../styles/components/werewolf/victory.module.scss';
import { WerewolfUser } from '../../../type/werewolf';
import Result from './result';
import {
    nextVictoryPhase,
    victoryPalette,
    victoryTeam,
    VictoryPhase,
} from '../victory';

const SakuraParticles = dynamic(
    () => import('../../../components/common/SakuraParticles'),
    { ssr: false }
);

type Props = {
    winMessage: string;
    winteamList: number[];
    userList: Array<WerewolfUser>;
    npcuser: WerewolfUser | null;
};

// 演出フェーズの長さ(タップでスキップ可)
const CELEBRATION_MS = 3000;

export default function VictoryOverlay({
    winMessage,
    winteamList,
    userList,
    npcuser,
}: Props) {
    const [phase, setPhase] = useState<VictoryPhase>('celebration');
    const team = victoryTeam(winteamList);
    const palette = useMemo(
        () => victoryPalette(winteamList),
        [winteamList]
    );

    useEffect(() => {
        if (phase !== 'celebration') {
            return;
        }
        const id = window.setTimeout(
            () => setPhase((p) => nextVictoryPhase(p, 'timer')),
            CELEBRATION_MS
        );
        return () => window.clearTimeout(id);
    }, [phase]);

    if (phase === 'closed') {
        return null;
    }

    const chars = Array.from(`${winMessage}の勝利`);

    return (
        <div
            className={`${styles.overlay} ${styles[team]}`}
            onClick={
                phase === 'celebration'
                    ? () => setPhase((p) => nextVictoryPhase(p, 'skip'))
                    : undefined
            }
        >
            <SakuraParticles mode="celebration" palette={palette} />
            <div className={styles.inner}>
                <p className={styles.message} role="status">
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
                {phase === 'celebration' && (
                    <p className={styles.skipHint}>タップでスキップ</p>
                )}
                {phase === 'result' && (
                    <div className={styles.resultCard}>
                        <Result
                            userList={userList}
                            winteamList={winteamList}
                            npcuser={npcuser}
                        />
                        <button
                            className={styles.returnBtn}
                            onClick={() =>
                                setPhase((p) => nextVictoryPhase(p, 'return'))
                            }
                        >
                            ロビーへ戻る
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
