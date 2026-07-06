import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from '../../../styles/components/werewolf/victory.module.scss';
import { WerewolfUser } from '../../../type/werewolf';
import RoleRevealAct from './RoleRevealAct';
import VerdictBanner from './VerdictBanner';
import ResultModal from './ResultModal';
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

// 種明かしの盤面は最後まで残し、勝敗バナー → 詳細モーダルを上に重ねる一枚絵構成
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
                {act !== 'reveal' && (
                    <VerdictBanner
                        winMessage={winMessage}
                        winteamList={winteamList}
                        compact={act === 'result'}
                    />
                )}
                <RoleRevealAct
                    userList={userList}
                    npcuser={npcuser}
                    finished={act !== 'reveal'}
                    onDone={() => setAct((a) => nextVictoryAct(a, 'advance'))}
                />
                {act === 'result' && (
                    <ResultModal
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
