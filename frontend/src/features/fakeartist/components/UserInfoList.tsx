import React from 'react';
import styles from '../../../styles/components/fakeartist/room.module.scss';
import { FakeArtistUser } from '../../../type/fakeartist';
import FakeartistUserInfo from './fakeartistuserInfo';

type Props = {
    playerData: FakeArtistUser;
    userList: Array<FakeArtistUser>;
    gameTime: number;
    turn: number;
    changeIcon: (src: string) => void;
    vote: (userName: string) => void;
    roomRemove: (userName: string) => void;
};

export default function UserInfoList({
    playerData,
    userList,
    gameTime,
    turn,
    changeIcon,
    vote,
    roomRemove,
}: Props) {
    return (
        <div className={styles.userfirld}>
            {playerData &&
                userList &&
                (gameTime === 0 || gameTime === 4) &&
                userList.map((user: FakeArtistUser, index: number) => {
                    return (
                        <FakeartistUserInfo
                            gameTime={gameTime}
                            playerData={playerData}
                            turn={turn}
                            user={user}
                            key={index}
                            changeIcon={changeIcon}
                            vote={vote}
                            roomRemove={roomRemove}
                        />
                    );
                })}
        </div>
    );
}
