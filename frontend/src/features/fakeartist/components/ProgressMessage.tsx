import React from 'react';
import styles from '../../../styles/components/fakeartist/room.module.scss';
import { FakeArtistUser } from '../../../type/fakeartist';
import Countdown from '../../../components/common/Countdown';
import Loadingdod from '../../../components/text/loadingdod';

type DrawTurnMessageProps = {
    playerData: FakeArtistUser;
    userList: Array<FakeArtistUser>;
    gameTime: number;
    theme: string;
};

export function DrawTurnMessage({
    playerData,
    userList,
    gameTime,
    theme,
}: DrawTurnMessageProps) {
    return (
        <>
            {/* お絵描き中情報エリア */}
            {playerData && gameTime === 1 && (
                <div className={styles.infomessage}>
                    <div className={styles.message}>
                        {playerData.rollNo === 1 ? (
                            <>
                                テーマ
                                <span>「{theme}」</span>
                            </>
                        ) : (
                            <>
                                あなたは
                                <span>エセ芸術家</span>
                                だ。それっぽく描こう！
                            </>
                        )}
                    </div>
                    <div className={styles.message}>
                        「
                        <span>
                            {userList.find(
                                (user: FakeArtistUser) => user.drawFlg
                            )
                                ? userList.find(
                                      (user: FakeArtistUser) => user.drawFlg
                                  ).userName
                                : ''}
                        </span>
                        」さんの番です。
                    </div>
                </div>
            )}
        </>
    );
}

type StatusMessageProps = {
    playerData: FakeArtistUser;
    gameTime: number;
    limitTime: number;
    endMessage: string;
    limittimeDone: () => void;
};

export function StatusMessage({
    playerData,
    gameTime,
    limitTime,
    endMessage,
    limittimeDone,
}: StatusMessageProps) {
    return (
        <>
            {/* ゲームメッセージ */}
            {gameTime === 2 && (
                <div className={styles.messagearea}>
                    <div className={styles.countdown}>
                        {limitTime > 0 && gameTime === 2 && (
                            <Countdown
                                timeLimit={limitTime}
                                limitDone={limittimeDone}
                            />
                        )}
                    </div>
                    議論中 <Loadingdod color={'rgb(17, 17, 17)'} />
                    {'　'}
                    <button className={styles.endbtn} onClick={limittimeDone}>
                        議論終了
                    </button>
                </div>
            )}

            {playerData && gameTime === 3 && (
                <div className={styles.messagearea}>
                    投票中 <Loadingdod color={'rgb(17, 17, 17)'} />
                </div>
            )}

            {playerData && gameTime === 4 && (
                <div className={`${styles.messagearea} ${styles.endmessage}`}>
                    {endMessage}
                </div>
            )}
        </>
    );
}
