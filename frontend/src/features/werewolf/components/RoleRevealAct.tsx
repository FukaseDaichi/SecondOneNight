import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from '../../../styles/components/werewolf/rolereveal.module.scss';
import { WerewolfUser } from '../../../type/werewolf';
import { isDeadUser, revealOrder } from '../victory';

type Props = {
    userList: Array<WerewolfUser>;
    npcuser: WerewolfUser | null;
    onDone: () => void;
    // true の間は進行を止め、全員開示済みの最終盤面を静的に表示する
    finished?: boolean;
};

// センターステージの進行: 登場 → カード開示 → (死亡者のみ)銃撃 → 次の人
type StagePhase = 'enter' | 'open' | 'shot';

const ENTER_MS = 900;
const OPEN_MS = 1600;
const SHOT_MS = 1800;
const DONE_DELAY_MS = 1400;

const getIconImgUrl = (user: WerewolfUser, npc: boolean) => {
    if (npc) {
        return '/images/icon/icon99.jpg';
    }
    return user.userIconUrl || '/images/icon/icon0.jpg';
};

// 銃痕: 中央の弾痕 + 放射状のひび割れ
function BulletHole({ small }: { small?: boolean }) {
    return (
        <svg
            viewBox="0 0 100 100"
            className={`${styles.bullethole} ${small ? styles.small : ''}`}
            aria-hidden="true"
        >
            <g
                stroke="rgba(16, 20, 22, 0.9)"
                strokeWidth="2.4"
                strokeLinecap="round"
            >
                <line x1="50" y1="50" x2="10" y2="38" />
                <line x1="50" y1="50" x2="22" y2="14" />
                <line x1="50" y1="50" x2="58" y2="6" />
                <line x1="50" y1="50" x2="88" y2="26" />
                <line x1="50" y1="50" x2="94" y2="58" />
                <line x1="50" y1="50" x2="74" y2="88" />
                <line x1="50" y1="50" x2="38" y2="92" />
                <line x1="50" y1="50" x2="8" y2="70" />
            </g>
            <g
                stroke="rgba(242, 251, 251, 0.4)"
                strokeWidth="1"
                strokeLinecap="round"
            >
                <line x1="50" y1="50" x2="16" y2="30" />
                <line x1="50" y1="50" x2="66" y2="10" />
                <line x1="50" y1="50" x2="90" y2="44" />
                <line x1="50" y1="50" x2="58" y2="90" />
                <line x1="50" y1="50" x2="14" y2="78" />
            </g>
            <circle cx="50" cy="50" r="16" fill="rgba(16, 20, 22, 0.95)" />
            <circle cx="50" cy="50" r="10" fill="#000" />
            <circle
                cx="50"
                cy="50"
                r="16.5"
                fill="none"
                stroke="rgba(120, 128, 132, 0.7)"
                strokeWidth="2"
            />
        </svg>
    );
}

// 第1幕: 種明かし。中央に1人ずつ登場し、キャラカードをフリップ開示。
// 死亡者は銃声とともに銃痕が刻まれ、開示済みの列にも痕が残る。
// finished 後は勝敗発表・結果の背景として最終盤面を残す
export default function RoleRevealAct({
    userList,
    npcuser,
    onDone,
    finished = false,
}: Props) {
    const ordered = useMemo(() => {
        const list = npcuser?.roll ? [...userList, npcuser] : userList;
        return revealOrder(list);
    }, [userList, npcuser]);
    const [index, setIndex] = useState(0);
    const [phase, setPhase] = useState<StagePhase>('enter');
    const allRevealed = finished || index >= ordered.length;
    const current = ordered[index];
    // finished(スキップ含む)なら全員を開示済みの列へ
    const revealed = finished ? ordered : ordered.slice(0, index);

    // 銃声: 銃撃フェーズに入った瞬間に一度だけ鳴らす
    useEffect(() => {
        if (phase !== 'shot') return;
        const audio = new Audio('/se/snip.mp3');
        audio.play().catch(() => {
            // 自動再生がブロックされても演出は続行する
        });
    }, [phase]);

    const advance = useCallback(() => {
        if (finished || allRevealed) return;
        if (phase === 'enter') {
            setPhase('open');
            return;
        }
        if (phase === 'open' && isDeadUser(ordered[index])) {
            setPhase('shot');
            return;
        }
        setIndex((i) => i + 1);
        setPhase('enter');
    }, [finished, allRevealed, phase, ordered, index]);

    useEffect(() => {
        if (finished) return;
        if (allRevealed) {
            const id = window.setTimeout(onDone, DONE_DELAY_MS);
            return () => window.clearTimeout(id);
        }
        const ms =
            phase === 'enter' ? ENTER_MS : phase === 'open' ? OPEN_MS : SHOT_MS;
        const id = window.setTimeout(advance, ms);
        return () => window.clearTimeout(id);
    }, [phase, index, finished, allRevealed, advance, onDone]);

    return (
        <div
            className={`${styles.act} ${finished ? styles.finished : ''}`}
            onClick={finished ? undefined : advance}
        >
            {!finished && <p className={styles.heading}>─ 種明かし ─</p>}
            <div className={styles.stage}>
                {!allRevealed && current && (
                    <div
                        key={`${current.userNo}-${current.userName}`}
                        className={`${styles.player} ${
                            phase !== 'enter' ? styles.opened : ''
                        } ${phase === 'shot' ? styles.shot : ''}`}
                    >
                        <div className={styles.who}>
                            <img
                                className={styles.icon}
                                src={getIconImgUrl(
                                    current,
                                    current === npcuser
                                )}
                                alt=""
                            />
                            <span className={styles.username}>
                                {current.userName}
                            </span>
                        </div>
                        <div className={styles.cardFlip}>
                            <div className={styles.cardInner}>
                                <div className={styles.cardBack} />
                                <div
                                    className={styles.cardFront}
                                    style={{
                                        backgroundImage: `url(/images/werewolf/roll/${current.roll?.rollNo}.jpg)`,
                                    }}
                                >
                                    <span className={styles.rollname}>
                                        {current.roll?.name ?? 'なし'}
                                    </span>
                                    {phase === 'shot' && <BulletHole />}
                                </div>
                            </div>
                        </div>
                        <span className={styles.voteTo}>
                            {current === npcuser
                                ? '─'
                                : `投票 → ${current.votingUserName || '─'}`}
                        </span>
                    </div>
                )}
                {!finished && phase === 'shot' && (
                    <div className={styles.flash} aria-hidden="true" />
                )}
            </div>
            <ul className={styles.doneRow}>
                {revealed.map((u) => {
                    const dead = isDeadUser(u);
                    return (
                        <li
                            key={`${u.userNo}-${u.userName}`}
                            className={`${styles.mini} ${
                                dead ? styles.dead : ''
                            }`}
                        >
                            <span
                                className={styles.miniArt}
                                style={{
                                    backgroundImage: `url(/images/werewolf/roll/${u.roll?.rollNo}.jpg)`,
                                }}
                            >
                                {dead && <BulletHole small />}
                            </span>
                            <span className={styles.miniName}>
                                {u.userName}
                            </span>
                            <span className={styles.miniRoll}>
                                {u.roll?.name ?? 'なし'}
                            </span>
                        </li>
                    );
                })}
            </ul>
            {!finished && (
                <p className={styles.hint}>
                    {allRevealed ? '─ 夜が明ける ─' : 'タップで次へ'}
                </p>
            )}
        </div>
    );
}
