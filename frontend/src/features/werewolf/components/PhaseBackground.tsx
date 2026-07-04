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
    if (turn === 4 && winteamList.length > 0) {
        if (winteamList[0] === 1) {
            return styles.resultWolf;
        }
        if (winteamList[0] === 2) {
            return styles.resultVillage;
        }
        return styles.resultThird;
    }
    return styles.day;
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
