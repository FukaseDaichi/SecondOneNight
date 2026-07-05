import React from 'react';
import styles from '../../../styles/components/werewolf/background.module.scss';

type Props = {
    turn: number;
    winteamList: number[];
};

const phaseClass = (turn: number, winteamList: number[]): string => {
    if (turn === 1) {
        return styles.night;
    }
    if (turn === 2) {
        return styles.discussion;
    }
    if (turn === 3) {
        return styles.voting;
    }
    if (turn === 4 && winteamList.length > 0) {
        const tint =
            winteamList[0] === 1
                ? styles.dawnWolf
                : winteamList[0] === 2
                  ? styles.dawnVillage
                  : styles.dawnThird;
        return `${styles.dawn} ${tint}`;
    }
    return styles.dusk;
};

export default function PhaseBackground({ turn, winteamList }: Props) {
    return (
        <div
            aria-hidden="true"
            className={`${styles.bg} ${phaseClass(turn, winteamList)}`}
        >
            <div className={styles.glowTeal}></div>
            <div className={styles.glowRose}></div>
        </div>
    );
}
