import React from 'react';
import styles from '../../../styles/components/werewolf/resultscroll.module.scss';
import { WerewolfUser } from '../../../type/werewolf';
import { isDeadUser } from '../victory';
import BulletHole from './BulletHole';

type Props = {
    userList: Array<WerewolfUser>;
    winteamList: number[];
    npcuser: WerewolfUser | null;
    onReturn: () => void;
};

type Entry = {
    user: WerewolfUser;
    npc: boolean;
};

const iconUrl = (e: Entry) =>
    e.npc
        ? '/images/icon/icon99.jpg'
        : e.user.userIconUrl || '/images/icon/icon0.jpg';

// 1人分の札: 役職アート+アイコン / 名前+役職 / 投票先+得票ドット
const PlayerCard = ({ entry, order }: { entry: Entry; order: number }) => {
    const { user, npc } = entry;
    const dead = isDeadUser(user);
    const votes = user.roll?.votingCount ?? 0;
    return (
        <li
            className={`${styles.card} ${dead ? styles.dead : ''}`}
            style={{ animationDelay: `${0.15 + order * 0.08}s` }}
        >
            <span
                className={styles.art}
                style={{
                    backgroundImage: user.roll
                        ? `url(/images/werewolf/roll/${user.roll.rollNo}.jpg)`
                        : undefined,
                }}
            >
                {dead && <BulletHole small />}
                <img className={styles.face} src={iconUrl(entry)} alt="" />
            </span>
            <span className={styles.who}>
                <span className={styles.name}>
                    {user.userName}
                    {dead && <span className={styles.deadTag}>散</span>}
                </span>
                <span className={styles.roll}>{user.roll?.name ?? 'なし'}</span>
            </span>
            <span className={styles.voteCol}>
                <span className={styles.voteTo}>
                    {npc ? '─' : `投票 → ${user.votingUserName || '─'}`}
                </span>
                <span className={styles.dots} aria-label={`得票 ${votes}票`}>
                    {Array.from({ length: votes }).map((_, i) => (
                        <i
                            key={i}
                            style={{
                                animationDelay: `${0.5 + order * 0.08 + i * 0.12}s`,
                            }}
                        />
                    ))}
                </span>
            </span>
        </li>
    );
};

// 第3幕: 詳細モーダル。勝者/敗者の2グループに分け、勝者には「勝」の印を押す
export default function ResultModal({
    userList,
    winteamList,
    npcuser,
    onReturn,
}: Props) {
    const isWin = (u: WerewolfUser) =>
        !!u.roll && winteamList.includes(u.roll.teamNo);
    const entries: Entry[] = [
        ...userList.map((user) => ({ user, npc: false })),
        ...(npcuser && npcuser.roll ? [{ user: npcuser, npc: true }] : []),
    ];
    const winners = entries.filter((e) => isWin(e.user));
    const losers = entries.filter((e) => !isWin(e.user));

    const group = (
        label: string,
        list: Entry[],
        win: boolean,
        offset: number
    ) =>
        list.length > 0 && (
            <section className={win ? styles.winGroup : styles.loseGroup}>
                <header className={styles.groupHead}>
                    <span className={styles.seal} aria-hidden="true">
                        {label}
                    </span>
                    <span className={styles.groupLabel}>
                        {win ? '勝利' : '敗北'}
                    </span>
                    <span className={styles.groupRule} aria-hidden="true" />
                </header>
                <ul className={styles.cards}>
                    {list.map((e, i) => (
                        <PlayerCard
                            key={`${e.user.userNo}-${e.user.userName}`}
                            entry={e}
                            order={offset + i}
                        />
                    ))}
                </ul>
            </section>
        );

    return (
        <div className={styles.modal} role="dialog" aria-modal="true">
            <div className={styles.scroll}>
                <p className={styles.heading}>─ 結果 ─</p>
                {group('勝', winners, true, 0)}
                {group('負', losers, false, winners.length)}
                <button className={styles.returnBtn} onClick={onReturn}>
                    ロビーへ戻る
                </button>
            </div>
        </div>
    );
}
