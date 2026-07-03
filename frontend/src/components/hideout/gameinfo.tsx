/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import styles from '../../styles/components/hideout/gameinfo.module.scss';

type GameInfoProps = {
    buildingCardList: Array<any>;
    memberCardList: Array<any>;
};

export default function GameInfo(props: GameInfoProps): JSX.Element {
    let hideout = 0;
    let hideoutSize = 0;

    props.buildingCardList.forEach((element) => {
        switch (element.cardType) {
            case 1:
                hideoutSize++;
                if (element.openFlg) {
                    hideout++;
                }
        }
    });

    const lastmenberNum = props.memberCardList.filter((element) => {
        return !element.consumeFlg;
    }).length;

    const rushtimes = Math.floor(Math.max(lastmenberNum / 4 - 1, 0));

    return (
        <div className={styles.gameinfo}>
            <div>
                <div className={styles.card}>
                    <img src="/images/hideout/hideout.png" alt="アジト" />
                </div>
                <div className={styles.data}>
                    <span>{hideout}</span>/<span>{hideoutSize}</span>
                </div>
            </div>
            <div>
                <div className={styles.card}>
                    <img src="/images/hideout/swatcard.png" alt="隊員" />
                </div>
                <div className={styles.data}>
                    <span>{rushtimes}</span> times left
                </div>
            </div>
        </div>
    );
}
