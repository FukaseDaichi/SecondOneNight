import React from 'react';
import { useRouter } from 'next/router';
import { SystemConst } from '../../const/next.config';
import Layout from '../../components/layout';
import Head from 'next/head';
import Chatmessage from '../../components/message/chatmessage';
import ChatComponent from '../../components/chatcomponent';
import styles from '../../styles/components/fakeartist/room.module.scss';
import Router from 'next/router';

import Start from '../../components/common/Start';
import Canvas from '../../components/fakeartist/canvas';
import { FakeArtistUser } from '../../type/fakeartist';
import FakeartistUserInfo from '../../components/fakeartist/fakeartistuserInfo';
import Countdown from '../../components/common/Countdown';
import Loadingdod from '../../components/text/loadingdod';
import Modal from '../../components/modal';
import UserInfoShort from '../../components/fakeartist/userInfoshort';
import RadioChips from '../../components/chips/radiochips';
import HeaderInfo from '../../components/fakeartist/headInfo';
import CountdownClock from '../../components/clock/countdownClock';
import Socialbtn from '../../components/button/sosialbtn';
import ConnectionStatus from '../../components/common/ConnectionStatus';
import { useFakeartistRoom } from '../../features/fakeartist/useFakeartistRoom';

export default function FakeArtistRoom() {
    // roomId取得
    const router = useRouter();
    const { roomId } = router.query;

    const {
        state,
        connected,
        status,
        entered,
        roomIn,
        roomRemove,
        changeRadio,
        changeIcon,
        chat,
        init,
        draw,
        vote,
        changeLimitTime,
        limittimeDone,
        personCanpasMouseDown,
        personCanpasMouseUp,
    } = useFakeartistRoom(roomId as string | undefined);

    const {
        playerData,
        userList,
        gameTime,
        turn,
        limitTime,
        theme,
        endMessage,
        patternList,
        messageList,
        chatList,
        startFlg,
        disscuttionStartFlg,
        votingStartFlg,
        endFlg,
        personCanvasZindex,
    } = state;

    return (
        <Layout home={false}>
            <style jsx global>
                {`
                    body {
                        overflow-x: hidden;
                        background-color: #d1d1d1;
                    }

                    body:before {
                        background-color: #d1d1d1;
                        position: fixed;
                        top: 0;
                        left: 0;
                        z-index: -1;
                        width: 100vw;
                        height: 100vh;
                        background: url(/images/fakeartist/fakeartistbackground.png);
                        -webkit-background-size: 370px;
                        background-size: 370px;
                        background-position: bottom left;
                        background-repeat: no-repeat;
                        opacity: 0.7;
                        content: '';
                    }
                `}
            </style>
            <Head>
                <meta
                    property="og:image"
                    content={
                        SystemConst.Server.SITE_URL +
                        '/images/fakeartist/fakeartistbackground.png'
                    }
                />
                <meta
                    property="og:title"
                    content="エセ芸術家ニューヨークへ行く"
                />
                <meta
                    property="og:description"
                    content="エセ芸術家ニューヨークへ行く　オンライン！"
                />
                <title>エセ芸術家ニューヨークへ行く</title>
            </Head>

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

            {/* 開始合図 */}
            {startFlg && <Start />}

            {/* 議論開始合図 */}
            {disscuttionStartFlg && (
                <Modal type="one">
                    <div className={styles.roundMessage}>議論開始</div>
                </Modal>
            )}

            {/* 投票開始合図 */}
            {votingStartFlg && (
                <Modal type="one">
                    <div className={styles.roundMessage}>投票開始！</div>
                </Modal>
            )}

            {/* 最後のメッセージ */}
            {endFlg && (
                <Modal type="two">
                    <div className={styles.roundEndMessage}>{endMessage}</div>
                </Modal>
            )}

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

            {/* メッセージエリア */}
            {messageList.map((value, index) => {
                if (index === messageList.length - 1) {
                    return (
                        <Chatmessage value={value} type="info" key={index} />
                    );
                }
            })}
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

            {/* ユーザ情報ショート */}
            {playerData && userList && (
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
            )}

            <ConnectionStatus status={status} />
            <div className={`${styles.roominbtn} ${entered ? styles.in : ''}`}>
                <p>
                    <label htmlFor="username">Name</label>
                </p>
                <input
                    disabled={!connected}
                    type="text"
                    id="username"
                    maxLength={20}
                    onKeyPress={(e) => {
                        // enterkey event
                        if (e.key == 'Enter') {
                            e.preventDefault();
                            const usernameDom: HTMLInputElement =
                                document.getElementById(
                                    'username'
                                ) as HTMLInputElement;
                            roomIn(usernameDom.value);
                        }
                    }}
                />
                <button
                    disabled={!connected}
                    onClick={() => {
                        const usernameDom: HTMLInputElement =
                            document.getElementById(
                                'username'
                            ) as HTMLInputElement;
                        roomIn(usernameDom.value);
                    }}
                >
                    Room IN
                </button>
            </div>

            {/* キャンパス */}
            {playerData && (
                <Canvas
                    drawFnc={draw}
                    playerData={playerData}
                    gameTime={gameTime}
                    personCanpasZindex={personCanvasZindex}
                    theme={theme}
                />
            )}

            {/* ユーザ情報 */}
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

            {playerData && (gameTime === 0 || gameTime === 4) && (
                <div className={styles.theme}>
                    <div className={styles.title}>テーマの種類</div>
                    <div className={styles.pattern}>
                        <RadioChips
                            id="theme_5"
                            onChangeFnc={() => changeRadio(5)}
                            checked={patternList.includes(5)}
                            tooltip={'食べ物のテーマを含む'}
                            rabel="食べ物"
                        />
                        <RadioChips
                            id="theme_4"
                            onChangeFnc={() => changeRadio(4)}
                            checked={patternList.includes(4)}
                            tooltip={'人の形をしたテーマを含む'}
                            rabel="人の形"
                        />
                        <RadioChips
                            id="theme_1"
                            onChangeFnc={() => changeRadio(1)}
                            checked={patternList.includes(1)}
                            tooltip={'おとぎ話のテーマを含む'}
                            rabel="おとぎ話"
                        />
                        <RadioChips
                            id="theme_2"
                            onChangeFnc={() => changeRadio(2)}
                            checked={patternList.includes(2)}
                            tooltip={'動物のテーマを含む'}
                            rabel="動物"
                        />
                        <RadioChips
                            id="theme_3"
                            onChangeFnc={() => changeRadio(3)}
                            checked={patternList.includes(3)}
                            tooltip={'スポーツのテーマを含む'}
                            rabel="スポーツ"
                        />
                    </div>
                </div>
            )}

            {/* 議論中の制限時間 */}
            {playerData && (gameTime === 0 || gameTime === 4) && (
                <div className={styles.rollselect}>
                    <div className={styles.title}>議論中の制限時間</div>

                    <div className={styles.limittimeinputarea}>
                        <div onClick={() => changeLimitTime(0)}>
                            <input
                                type="radio"
                                id="limit-time-0"
                                name="limit-time"
                                value="0"
                                checked={limitTime === 0}
                                readOnly
                            />
                            <label htmlFor="limit-time-0">
                                <span>なし</span>
                            </label>
                            <div className={styles.teban}>
                                <img
                                    src={'/images/sunadokei_black.png'}
                                    alt="手番"
                                />
                            </div>
                        </div>
                        <div onClick={() => changeLimitTime(60)}>
                            <input
                                type="radio"
                                id="limit-time-60"
                                name="limit-time"
                                value="60"
                                checked={limitTime === 60}
                                readOnly
                            />
                            <label htmlFor="limit-time-60">
                                <span>1</span>分
                            </label>
                            <div className={styles.teban}>
                                <img
                                    src={'/images/sunadokei_black.png'}
                                    alt="手番"
                                />
                            </div>
                        </div>
                        <div onClick={() => changeLimitTime(120)}>
                            <input
                                type="radio"
                                id="limit-time-120"
                                name="limit-time"
                                value="120"
                                checked={limitTime === 120}
                                readOnly
                            />
                            <label htmlFor="limit-time-120">
                                <span>2</span>分
                            </label>
                            <div className={styles.teban}>
                                <img
                                    src={'/images/sunadokei_black.png'}
                                    alt="手番"
                                />
                            </div>
                        </div>
                        <div onClick={() => changeLimitTime(180)}>
                            <input
                                type="radio"
                                id="limit-time-180"
                                name="limit-time"
                                value="180"
                                checked={limitTime === 180}
                                readOnly
                            />
                            <label htmlFor="limit-time-180">
                                <span>3</span>分
                            </label>
                            <div className={styles.teban}>
                                <img
                                    src={'/images/sunadokei_black.png'}
                                    alt="手番"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.btnarea}>
                <button
                    onClick={() => {
                        Router.push('/');
                    }}
                >
                    HOME
                </button>
                <button onClick={init}>
                    {turn > 0 && turn < 4 ? 'GAME RESET' : 'GAME START'}
                </button>
            </div>

            {/* チャットのやり取り（機能OFF） */}
            {false && <ChatComponent chatList={chatList} chat={chat} />}

            <div className={styles.rulebtn}>
                <button
                    onClick={() => {
                        window.open(
                            'https://bdg.kirinnox.com/entry/ese-geijutsuka'
                        );
                    }}
                >
                    遊び方
                </button>
            </div>
            <Socialbtn
                url={SystemConst.Server.SITE_URL + '/fakeartist/' + roomId}
                title={'セカンドワンナイト人狼'}
                via={'ブラウザ上で正体隠匿ゲームが遊べます。'}
            />
        </Layout>
    );
}
