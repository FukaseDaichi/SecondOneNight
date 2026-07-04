/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import BuildCard from './buildcard';
import UserInfo from './userInfo';
import RushTurn from './rushturn';
import styles from '../../../styles/components/hideout/room.module.scss';
import { SystemConst } from '../../../const/next.config';
import { HideoutUser } from '../types';

type PlayAreaProps = {
    firldBuilding: any | null;
    userList: HideoutUser[];
    wait: (index: number) => void;
    waitUserIndexList: number[];
    playerName: string | null;
    winnerTeam: number;
    turn: number;
    changeIcon: (iconUrl: string) => void;
    rushAreaFlg: boolean;
    memberFirldList: any[];
    rush: (index: number) => void;
    closeRushArea: () => void;
};

export default function PlayArea({
    firldBuilding,
    userList,
    wait,
    waitUserIndexList,
    playerName,
    winnerTeam,
    turn,
    changeIcon,
    rushAreaFlg,
    memberFirldList,
    rush,
    closeRushArea,
}: PlayAreaProps) {
    return (
        <>
            {/* フィールド情報 */}
            {firldBuilding && (
                <div className={styles.firldBuild}>
                    <BuildCard
                        buildingCard={firldBuilding}
                        userList={userList}
                        wait={wait}
                        waitUserIndexList={waitUserIndexList}
                        ownFlg={false}
                    />
                </div>
            )}
            {/* ユーザ情報 */}
            <div className={styles.userfirld}>
                {userList.map((user, index: number) => {
                    return (
                        <UserInfo
                            key={index}
                            user={user}
                            ownFlg={user.userName === playerName}
                            userColor={SystemConst.PLAYER_COLOR_LIST[index]}
                            changeIcon={changeIcon}
                            userList={userList}
                            wait={wait}
                            winnerTeam={winnerTeam}
                            turn={turn}
                        />
                    );
                })}
            </div>
            {rushAreaFlg && (
                <RushTurn
                    userList={userList}
                    playerName={playerName}
                    rush={rush}
                    memberFirldList={memberFirldList}
                    endFnc={closeRushArea}
                />
            )}
        </>
    );
}
