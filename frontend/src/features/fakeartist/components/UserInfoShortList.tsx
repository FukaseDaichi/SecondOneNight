import React from 'react';
import styles from '../../../styles/components/fakeartist/room.module.scss';
import { FakeArtistUser } from '../../../type/fakeartist';
import UserInfoShort from './userInfoshort';

type Props = {
    playerData: FakeArtistUser;
    userList: Array<FakeArtistUser>;
    gameTime: number;
    turn: number;
    changeIcon: (src: string) => void;
    vote: (userName: string) => void;
    roomRemove: (userName: string) => void;
    personCanpasMouseDown: (userName: string) => void;
    personCanpasMouseUp: () => void;
};

export default function UserInfoShortList({
    playerData,
    userList,
    gameTime,
    turn,
    changeIcon,
    vote,
    roomRemove,
    personCanpasMouseDown,
    personCanpasMouseUp,
}: Props) {
    if (!playerData || !userList) {
        return null;
    }
    return (
        <div className={styles.userinfofirld}>
            {userList.map((user: FakeArtistUser, index: number) => {
                return (
                    <UserInfoShort
                        gameTime={gameTime}
                        playerData={playerData}
                        turn={turn}
                        user={user}
                        key={index}
                        changeIcon={changeIcon}
                        vote={vote}
                        roomRemove={roomRemove}
                        mouseon={personCanpasMouseDown}
                        mouseout={personCanpasMouseUp}
                    />
                );
            })}
        </div>
    );
}
