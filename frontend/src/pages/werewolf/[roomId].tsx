/* eslint-disable no-irregular-whitespace */
import React from 'react';
import { useRouter } from 'next/router';
import { SystemConst } from '../../const/next.config';
import Layout from '../../components/layout';
import Head from 'next/head';
import Chatmessage from '../../components/message/chatmessage';
import ChatComponent from '../../components/chatcomponent';
import UserInfo from '../../components/werewolf/userInfo';
import styles from '../../styles/components/werewolf/room.module.scss';
import Router from 'next/router';
import Start from '../../components/common/Start';
import RollCard from '../../components/werewolf/rollcard';
import ModalRollCard from '../../components/werewolf/modalrollcard';
import RollInfo from '../../components/werewolf/rollinfo';
import RollSelectTurn from '../../components/werewolf/rollselectturn';
import CutIn from '../../components/werewolf/cutin';
import WerewolfSet from '../../components/werewolf/werewolfset';
import Rule from '../../components/werewolf/rule';
import Result from '../../components/werewolf/result';
import Countdown from '../../components/werewolf/countdown';
import { WerewolfRoll } from '../../type/werewolf';
import Modal from '../../components/modal';
import CircleBtn from '../../components/button/circlebtn';
import Loadingdod from '../../components/text/loadingdod';
import Socialbtn from '../../components/button/sosialbtn';
import ConnectionStatus from '../../components/common/ConnectionStatus';
import { useWerewolfRoom } from '../../features/werewolf/useWerewolfRoom';

export default function WerewolfRoom() {
    // roomId取得
    const router = useRouter();
    const { roomId } = router.query;

    const {
        state,
        connected,
        status,
        entered,
        roomIn,
        chat,
        changeIcon,
        setRoll,
        setRollSet,
        init,
        selectRoll,
        userAction,
        changeLimitTime,
        limittimeDone,
        counter,
        setModalRoll,
        setModalOwnFlg,
        setRuleFlg,
        setResultFlg,
        playerActionName,
        playerNPCActionName,
    } = useWerewolfRoom(roomId as string | undefined);

    const {
        playerName,
        messageList,
        chatList,
        userList,
        turn,
        winteamList,
        staticRollList,
        rollList,
        playerData,
        npcuser,
        limitTime,
        rollInfoList,
        counterMap,
        startFlg,
        modalRoll,
        modalOwnFlg,
        rollSelectTurnFlg,
        votingStartFlg,
        cutInNo,
        resultFlg,
        ruleFlg,
        winMessage,
    } = state;

    return (
        <Layout home={false}>
            <style jsx global>
                {`
                    body {
                        overflow-x: hidden;
                        background-color: #f3f3f3;
                    }

                    body:before {
                        position: fixed;
                        top: 0;
                        left: 0;
                        z-index: -1;
                        width: 100vw;
                        height: 100vh;
                        background: url(/images/werewolf/werewolfbackground.png);
                        -webkit-background-size: 370px;
                        background-size: 370px;
                        background-position: bottom left;
                        background-repeat: no-repeat;
                        content: '';
                    }
                `}
            </style>
            <Head>
                <meta
                    property="og:image"
                    content={
                        SystemConst.Server.SITE_URL +
                        '/images/werewolf/werewolfbackground.png'
                    }
                />
                <meta property="og:title" content="セカンドワンナイト人狼" />
                <meta
                    property="og:description"
                    content="セカンドワンナイト人狼！　役職を選べる1日で終わる人狼ゲーム！ 初心者にもおすすめ！"
                />
                <title>セカンドワンナイト人狼</title>
            </Head>
            {/* 開始合図 */}
            {startFlg && <Start />}
            {/* 投票時間 */}
            {votingStartFlg && (
                <Modal type="one">
                    <div className={styles.roundMessage}>投票時間</div>
                </Modal>
            )}
            {/* カットイン */}
            {cutInNo > 0 && <CutIn rollNo={cutInNo} />}
            {/* 勝利文字 */}
            {winMessage != null && turn === 4 && (
                <div className={styles.winmessage}>
                    <div className={styles.message}>
                        <span>{winMessage}</span>の勝利
                    </div>
                    <div className={styles.resultbtn}>
                        <CircleBtn
                            value="詳細"
                            size={50}
                            onClickFnc={() => setResultFlg(true)}
                        />
                    </div>
                </div>
            )}
            {/* 結果 */}
            {resultFlg && (
                <Result
                    endFnc={() => setResultFlg(false)}
                    userList={userList}
                    winteamList={winteamList}
                    npcuser={npcuser}
                />
            )}

            {/* メッセージエリア */}
            {turn === 1 && (
                <div className={styles.messagearea}>
                    選択中 <Loadingdod color={'rgb(17, 17, 17)'} />
                </div>
            )}
            {turn === 2 && (
                <div className={styles.messagearea}>
                    {limitTime > 0 && !votingStartFlg && (
                        <Countdown
                            timeLimit={limitTime}
                            limitDone={limittimeDone}
                        />
                    )}
                    議論中 <Loadingdod color={'rgb(17, 17, 17)'} />
                    <button className={styles.endbtn} onClick={limittimeDone}>
                        議論終了
                    </button>
                </div>
            )}

            {turn === 3 && (
                <div className={styles.messagearea}>
                    投票中 <Loadingdod color={'rgb(17, 17, 17)'} />
                </div>
            )}
            {messageList.map((value, index) => {
                if (index === messageList.length - 1) {
                    return (
                        <Chatmessage value={value} type="info" key={index} />
                    );
                }
            })}
            <ConnectionStatus status={status} />
            <div
                className={`${styles.roominbtn} ${entered ? styles.in : ''}`}
            >
                <p>
                    <label htmlFor="username">Name</label>
                </p>
                <input
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
                    disabled={!connected}
                />
                <button
                    onClick={() => {
                        const usernameDom: HTMLInputElement =
                            document.getElementById(
                                'username'
                            ) as HTMLInputElement;
                        roomIn(usernameDom.value);
                    }}
                    disabled={!connected}
                >
                    Room IN
                </button>
            </div>
            {/* ユーザ情報 */}
            {playerData && (
                <div className={styles.userfirld}>
                    {userList.map((user, index: number) => {
                        return (
                            <UserInfo
                                playerData={playerData}
                                key={index}
                                user={user}
                                ownFlg={user.userName === playerName}
                                userColor={SystemConst.PLAYER_COLOR_LIST[index]}
                                changeIcon={changeIcon}
                                turn={turn}
                                userAction={userAction}
                                setModalRoll={setModalRoll}
                                playerActionName={playerActionName}
                                winteamList={winteamList}
                                setModalOwnFlg={setModalOwnFlg}
                            />
                        );
                    })}
                    {npcuser && (
                        <UserInfo
                            playerData={playerData}
                            user={npcuser}
                            ownFlg={false}
                            userColor={
                                SystemConst.PLAYER_COLOR_LIST[
                                    npcuser.userNo + 1
                                ]
                            }
                            changeIcon={changeIcon}
                            turn={turn}
                            userAction={userAction}
                            setModalRoll={setModalRoll}
                            playerActionName={playerNPCActionName}
                            winteamList={winteamList}
                            setModalOwnFlg={setModalOwnFlg}
                        />
                    )}
                </div>
            )}
            {/* 役職情報 */}
            {rollList.length > 0 && (
                <RollInfo
                    rollList={rollInfoList}
                    setModalRoll={setModalRoll}
                    userList={userList}
                    turn={turn}
                    setModalOwnFlg={setModalOwnFlg}
                />
            )}

            {/* 役職おすすめセット */}
            {playerData && (turn === 0 || turn === 4) && (
                <WerewolfSet
                    userSize={userList.length}
                    changeFnc={setRollSet}
                />
            )}

            {/* 役職カスタマイズ */}
            {playerData && (turn === 0 || turn === 4) && (
                <div className={styles.rollselect}>
                    <div className={styles.title}>
                        役職カスタマイズ{'　　　　'}
                        <CircleBtn
                            value="設定"
                            size={48}
                            onClickFnc={setRoll}
                        />
                    </div>
                    {staticRollList.map(
                        (element: WerewolfRoll, index: number) => {
                            return (
                                <div
                                    key={index}
                                    style={{ order: element.teamNo }}
                                >
                                    <RollCard
                                        roll={element}
                                        size={60}
                                        fontSize={1.2}
                                        modalView={() => setModalRoll(element)}
                                        turn={turn}
                                        ownFlg={false}
                                        setModalOwnFlg={setModalOwnFlg}
                                    />
                                    <div className={styles.counter}>
                                        <div
                                            className={styles.counterbtn}
                                            onClick={() => {
                                                counter(element.rollNo, -1);
                                            }}
                                        >
                                            -
                                        </div>
                                        <div className={styles.number}>
                                            {counterMap[element.rollNo] || 0}
                                        </div>
                                        <div
                                            className={styles.counterbtn}
                                            onClick={() => {
                                                counter(element.rollNo, 1);
                                            }}
                                        >
                                            +
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                    )}
                </div>
            )}

            {playerData && (turn === 0 || turn === 4) && (
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
                        <div onClick={() => changeLimitTime(300)}>
                            <input
                                type="radio"
                                id="limit-time-300"
                                name="limit-time"
                                value="300"
                                checked={limitTime === 300}
                                readOnly
                            />
                            <label htmlFor="limit-time-300">
                                <span>5</span>分
                            </label>
                            <div className={styles.teban}>
                                <img
                                    src={'/images/sunadokei_black.png'}
                                    alt="手番"
                                />
                            </div>
                        </div>
                        <div onClick={() => changeLimitTime(420)}>
                            <input
                                type="radio"
                                id="limit-time-420"
                                name="limit-time"
                                value="420"
                                checked={limitTime === 420}
                                readOnly
                            />
                            <label htmlFor="limit-time-420">
                                <span>7</span>分
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

            {modalRoll && (
                <ModalRollCard
                    roll={modalRoll}
                    hidden={() => {
                        setTimeout(() => {
                            setModalRoll(null);
                        }, 450);
                    }}
                    turn={turn}
                    ownFlg={modalOwnFlg}
                />
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
            {!startFlg && rollSelectTurnFlg && playerData && (
                <RollSelectTurn
                    turn={turn}
                    user={playerData}
                    setModalRoll={setModalRoll}
                    selectRoll={selectRoll}
                    roll={playerData.roll}
                    userList={userList}
                    rollList={rollList}
                    setModalOwnFlg={setModalOwnFlg}
                />
            )}
            <div className={styles.rulebtn}>
                <button onClick={() => setRuleFlg(true)}>遊び方</button>
                {ruleFlg && <Rule endFnc={() => setRuleFlg(false)} />}
            </div>
            <Socialbtn
                url={SystemConst.Server.SITE_URL + '/werewolf/' + roomId}
                title={'セカンドワンナイト人狼'}
                via={
                    'セカンドワンナイト人狼　リアルタイムに能力が使えるオンラインならではのスタイリッシュアクション招待隠匿ゲーム！'
                }
            />
        </Layout>
    );
}
