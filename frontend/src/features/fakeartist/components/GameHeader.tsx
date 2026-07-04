import React from 'react';
import styles from '../../../styles/components/fakeartist/room.module.scss';
import { FakeArtistUser } from '../../../type/fakeartist';
import HeaderInfo from './headInfo';
import CountdownClock from '../../../components/clock/countdownClock';

type Props = {
    playerData: FakeArtistUser;
    userList: Array<FakeArtistUser>;
    gameTime: number;
    limitTime: number;
    theme: string;
    endMessage: string;
    startFlg: boolean;
    limittimeDone: () => void;
};

export default function GameHeader({
    playerData,
    userList,
    gameTime,
    limitTime,
    theme,
    endMessage,
    startFlg,
    limittimeDone,
}: Props) {
    return (
        <>
            {playerData && playerData.rollNo > 0 && (
                <HeaderInfo bgc={'rgb(105,107,108,0.9)'}>
                    <div className={styles.headerinfo}>
                        <div className={styles.headertheme}>
                            {playerData.rollNo === 1 ? (
                                <>
                                    <p>テーマ</p>
                                    <span>「{theme}」</span>
                                </>
                            ) : (
                                <>
                                    <p>テーマ</p>
                                    <span>「？？？？」</span>
                                </>
                            )}
                        </div>
                        <div className={styles.headermessage}>
                            {gameTime === 1 && (
                                <div className={styles.message}>
                                    「
                                    <span>
                                        {userList.find(
                                            (user: FakeArtistUser) =>
                                                user.drawFlg
                                        )
                                            ? userList.find(
                                                  (user: FakeArtistUser) =>
                                                      user.drawFlg
                                              ).userName
                                            : ''}
                                    </span>
                                    」さんの番です。
                                </div>
                            )}
                            {gameTime === 2 && (
                                <div className={styles.headerinfomation}>
                                    <p>議論中</p>{' '}
                                    <button onClick={limittimeDone}>
                                        議論終了
                                    </button>
                                </div>
                            )}
                            {limitTime > 0 && gameTime === 2 && (
                                <div className={styles.countdown}>
                                    <CountdownClock
                                        timeLimit={limitTime}
                                        limitDone={limittimeDone}
                                    />
                                </div>
                            )}

                            {gameTime === 3 && (
                                <div className={styles.headerinfomation}>
                                    投票中
                                </div>
                            )}
                            {gameTime === 4 && (
                                <div className={styles.headerinfomation}>
                                    {endMessage}
                                </div>
                            )}
                        </div>

                        <div className={styles.roll}>
                            <p>
                                {playerData.rollNo === 1
                                    ? '芸術家'
                                    : 'エセ芸術家'}
                            </p>
                            <img
                                src={`/images/fakeartist/${playerData.rollNo}.png`}
                                alt="役職"
                            />
                        </div>
                    </div>
                </HeaderInfo>
            )}

            {playerData && !startFlg && playerData.rollNo > 0 && (
                <div className={styles.pcroll}>
                    <p>{playerData.rollNo === 1 ? '芸術家' : 'エセ芸術家'}</p>
                    <img
                        src={`/images/fakeartist/${playerData.rollNo}.png`}
                        alt="役職"
                    />
                </div>
            )}
        </>
    );
}
