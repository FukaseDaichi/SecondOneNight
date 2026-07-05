import React from 'react';
import styles from '../../../styles/components/werewolf/resultscroll.module.scss';
import { WerewolfUser } from '../../../type/werewolf';
import { isDeadUser } from '../victory';

type Props = {
	userList: Array<WerewolfUser>;
	winteamList: number[];
	npcuser: WerewolfUser | null;
	onReturn: () => void;
};

const Row = ({
	user,
	win,
	npc,
}: {
	user: WerewolfUser;
	win: boolean;
	npc?: boolean;
}) => {
	const dead = isDeadUser(user);
	return (
		<li
			className={`${styles.row} ${win ? styles.win : ''} ${
				dead ? styles.dead : ''
			}`}
		>
			<span className={styles.name}>
				{user.userName}
				{dead && <span className={styles.deadTag}>散</span>}
			</span>
			<span className={styles.roll}>{user.roll?.name ?? 'なし'}</span>
			<span className={styles.vote}>
				{npc ? '─' : `→ ${user.votingUserName || 'なし'}`}
			</span>
			<span className={styles.count}>
				{user.roll ? `${user.roll.votingCount}票` : '─'}
			</span>
			<span className={styles.verdict}>{win ? '勝' : '負'}</span>
		</li>
	);
};

// 第3幕: 巻物風の結果一覧
export default function ResultScroll({
	userList,
	winteamList,
	npcuser,
	onReturn,
}: Props) {
	const isWin = (u: WerewolfUser) =>
		!!u.roll && winteamList.includes(u.roll.teamNo);
	return (
		<div className={styles.scroll}>
			<p className={styles.heading}>─ 結果 ─</p>
			<ul className={styles.list}>
				{userList.map((u) => (
					<Row key={u.userNo} user={u} win={isWin(u)} />
				))}
				{npcuser && npcuser.roll && (
					<Row user={npcuser} win={isWin(npcuser)} npc />
				)}
			</ul>
			<button className={styles.returnBtn} onClick={onReturn}>
				ロビーへ戻る
			</button>
		</div>
	);
}
