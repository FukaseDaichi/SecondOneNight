import React from 'react';
import { useRouter } from 'next/router';
import { SystemConst } from '../../const/next.config';
import Layout from '../../components/layout';
import Head from 'next/head';
import Chatmessage from '../../components/message/chatmessage';
import ChatComponent from '../../components/chatcomponent';
import styles from '../../styles/components/werewolf/room.module.scss';
import Router from 'next/router';
import RollInfo from '../../features/werewolf/components/rollinfo';
import WerewolfSet from '../../features/werewolf/components/werewolfset';
import Socialbtn from '../../components/button/sosialbtn';
import ConnectionStatus from '../../components/common/ConnectionStatus';
import RoomInForm from '../../components/common/RoomInForm';
import TurnMessage from '../../features/werewolf/components/TurnMessage';
import RollCustomize from '../../features/werewolf/components/RollCustomize';
import LimitTimeSelector from '../../features/werewolf/components/LimitTimeSelector';
import Overlays from '../../features/werewolf/components/Overlays';
import UserField from '../../features/werewolf/components/UserField';
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
            <Overlays
                startFlg={startFlg}
                votingStartFlg={votingStartFlg}
                cutInNo={cutInNo}
                winMessage={winMessage}
                turn={turn}
                setResultFlg={setResultFlg}
                resultFlg={resultFlg}
                userList={userList}
                winteamList={winteamList}
                npcuser={npcuser}
                modalRoll={modalRoll}
                setModalRoll={setModalRoll}
                modalOwnFlg={modalOwnFlg}
                rollSelectTurnFlg={rollSelectTurnFlg}
                playerData={playerData}
                selectRoll={selectRoll}
                rollList={rollList}
                setModalOwnFlg={setModalOwnFlg}
                ruleFlg={ruleFlg}
                setRuleFlg={setRuleFlg}
            />

            {/* メッセージエリア */}
            <TurnMessage
                turn={turn}
                limitTime={limitTime}
                votingStartFlg={votingStartFlg}
                limittimeDone={limittimeDone}
            />
            {messageList.map((value, index) => {
                if (index === messageList.length - 1) {
                    return (
                        <Chatmessage value={value} type="info" key={index} />
                    );
                }
            })}
            <ConnectionStatus status={status} />
            <RoomInForm
                connected={connected}
                entered={entered}
                onRoomIn={roomIn}
                className={styles.roominbtn}
                enteredClassName={styles.in}
            />
            {/* ユーザ情報 */}
            {playerData && (
                <UserField
                    playerData={playerData}
                    playerName={playerName}
                    userList={userList}
                    npcuser={npcuser}
                    turn={turn}
                    changeIcon={changeIcon}
                    userAction={userAction}
                    setModalRoll={setModalRoll}
                    playerActionName={playerActionName}
                    playerNPCActionName={playerNPCActionName}
                    winteamList={winteamList}
                    setModalOwnFlg={setModalOwnFlg}
                />
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
                <RollCustomize
                    staticRollList={staticRollList}
                    counterMap={counterMap}
                    counter={counter}
                    setRoll={setRoll}
                    setModalRoll={setModalRoll}
                    setModalOwnFlg={setModalOwnFlg}
                    turn={turn}
                />
            )}

            {playerData && (turn === 0 || turn === 4) && (
                <LimitTimeSelector
                    limitTime={limitTime}
                    changeLimitTime={changeLimitTime}
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
