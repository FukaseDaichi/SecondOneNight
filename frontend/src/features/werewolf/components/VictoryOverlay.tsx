import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from '../../../styles/components/werewolf/victory.module.scss';
import { WerewolfUser } from '../../../type/werewolf';
import RoleRevealAct from './RoleRevealAct';
import VerdictAct from './VerdictAct';
import ResultScroll from './ResultScroll';
import { nextVictoryAct, victoryPalette, VictoryAct } from '../victory';

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

// 勝敗発表の自動送り(タップでも送れる)
const VERDICT_MS = 4000;

export default function VictoryOverlay({
    winMessage,
    winteamList,
    userList,
    npcuser,
}: Props) {
    const [act, setAct] = useState<VictoryAct>('reveal');
    const palette = useMemo(() => victoryPalette(winteamList), [winteamList]);

    useEffect(() => {
        if (act !== 'verdict') return;
        const id = window.setTimeout(
            () => setAct((a) => nextVictoryAct(a, 'advance')),
            VERDICT_MS
        );
        return () => window.clearTimeout(id);
    }, [act]);

    if (act === 'closed') {
        return null;
    }

    return (
        <div
            className={`${styles.overlay} ${styles[`act-${act}`]}`}
            onClick={
                act === 'verdict'
                    ? () => setAct((a) => nextVictoryAct(a, 'advance'))
                    : undefined
            }
        >
            {act !== 'reveal' && (
                <SakuraParticles mode="celebration" palette={palette} />
            )}
            <div className={styles.inner}>
                {act === 'reveal' && (
                    <RoleRevealAct
                        userList={userList}
                        npcuser={npcuser}
                        onDone={() =>
                            setAct((a) => nextVictoryAct(a, 'advance'))
                        }
                    />
                )}
                {act === 'verdict' && (
                    <VerdictAct
                        winMessage={winMessage}
                        winteamList={winteamList}
                        userList={userList}
                    />
                )}
                {act === 'result' && (
                    <ResultScroll
                        userList={userList}
                        winteamList={winteamList}
                        npcuser={npcuser}
                        onReturn={() =>
                            setAct((a) => nextVictoryAct(a, 'return'))
                        }
                    />
                )}
                {act === 'reveal' && (
                    <button
                        className={styles.skipBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            setAct((a) => nextVictoryAct(a, 'skip'));
                        }}
                    >
                        スキップ
                    </button>
                )}
            </div>
        </div>
    );
}
