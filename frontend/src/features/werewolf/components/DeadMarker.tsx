import React from 'react';
import styles from '../../../styles/components/werewolf/deadmarker.module.scss';

// 死亡者マーカー: モノクロ化は親カード側(styles.dead)、本部品は「散」帯+煙
export default function DeadMarker() {
	return (
		<div className={styles.marker} aria-label="脱落">
			<span className={styles.band}>散</span>
			<span className={styles.smoke} aria-hidden="true"></span>
		</div>
	);
}
