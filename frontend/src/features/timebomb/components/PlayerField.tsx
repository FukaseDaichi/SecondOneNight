import React from 'react';
import { TimeBombUser, LeadCards } from '../../../type';
import styles from '../../../styles/components/timebomb/room.module.scss';
import UserInfo from './userInfo';

type Props = {
    timeBombUserList: Array<TimeBombUser>;
    leadCardsList: Array<LeadCards>;
    round: number;
    playerName: string;
    play: (cardIndex: number) => void;
    changeIcon: (url: string) => void;
    endFlg: boolean;
    secretFlg: boolean;
    startFlg: boolean;
};

export default function PlayerField({
    timeBombUserList,
    leadCardsList,
    round,
    playerName,
    play,
    changeIcon,
    endFlg,
    secretFlg,
    startFlg,
}: Props) {
    return (
        <div className={styles.userInfo}>
            {timeBombUserList.map((value: TimeBombUser, index: number) => {
                // 手札作成
                const cardsList: Array<LeadCards> = [];
                if (leadCardsList) {
                    leadCardsList.forEach(
                        (value: LeadCards, cardIndex: number) => {
                            if (
                                Math.floor(cardIndex / (6 - round)) === index
                            ) {
                                cardsList.push(leadCardsList[cardIndex]);
                            }
                        }
                    );
                }
                return (
                    <UserInfo
                        user={value}
                        cardlist={cardsList}
                        key={index}
                        ownFlg={playerName === value.userName}
                        playfnc={play}
                        round={round}
                        changeIcon={changeIcon}
                        endFlg={endFlg}
                        secretFlg={secretFlg}
                        startFlg={startFlg}
                    ></UserInfo>
                );
            })}
        </div>
    );
}
