import React from 'react';
import { useRouter } from 'next/router';
import { SystemConst } from '../../const/next.config';
import Layout from '../../components/layout';
import Head from 'next/head';
import Chatmessage from '../../components/message/chatmessage';
import ChatComponent from '../../components/chatcomponent';
import styles from '../../styles/components/fakeartist/room.module.scss';
import Router from 'next/router';

import Canvas from '../../features/fakeartist/components/canvas';
import UserInfoShortList from '../../features/fakeartist/components/UserInfoShortList';
import UserInfoList from '../../features/fakeartist/components/UserInfoList';
import Socialbtn from '../../components/button/sosialbtn';
import ConnectionStatus from '../../components/common/ConnectionStatus';
import RoomInForm from '../../components/common/RoomInForm';
import GameHeader from '../../features/fakeartist/components/GameHeader';
import ThemeSelector from '../../features/fakeartist/components/ThemeSelector';
import LimitTimeSelector from '../../features/fakeartist/components/LimitTimeSelector';
import RoundOverlays from '../../features/fakeartist/components/RoundOverlays';
import {
    DrawTurnMessage,
    StatusMessage,
} from '../../features/fakeartist/components/ProgressMessage';
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
                <meta name="robots" content="noindex, nofollow" />
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

            <GameHeader
                playerData={playerData}
                userList={userList}
                gameTime={gameTime}
                limitTime={limitTime}
                theme={theme}
                endMessage={endMessage}
                startFlg={startFlg}
                limittimeDone={limittimeDone}
            />

            <RoundOverlays
                startFlg={startFlg}
                disscuttionStartFlg={disscuttionStartFlg}
                votingStartFlg={votingStartFlg}
                endFlg={endFlg}
                endMessage={endMessage}
            />

            <DrawTurnMessage
                playerData={playerData}
                userList={userList}
                gameTime={gameTime}
                theme={theme}
            />

            {/* メッセージエリア */}
            {messageList.map((value, index) => {
                if (index === messageList.length - 1) {
                    return (
                        <Chatmessage value={value} type="info" key={index} />
                    );
                }
            })}

            <StatusMessage
                playerData={playerData}
                gameTime={gameTime}
                limitTime={limitTime}
                endMessage={endMessage}
                limittimeDone={limittimeDone}
            />

            {/* ユーザ情報ショート */}
            <UserInfoShortList
                playerData={playerData}
                userList={userList}
                gameTime={gameTime}
                turn={turn}
                changeIcon={changeIcon}
                vote={vote}
                roomRemove={roomRemove}
                personCanpasMouseDown={personCanpasMouseDown}
                personCanpasMouseUp={personCanpasMouseUp}
            />

            <ConnectionStatus status={status} />
            <RoomInForm
                connected={connected}
                entered={entered}
                onRoomIn={roomIn}
                className={styles.roominbtn}
                enteredClassName={styles.in}
            />

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
            <UserInfoList
                playerData={playerData}
                userList={userList}
                gameTime={gameTime}
                turn={turn}
                changeIcon={changeIcon}
                vote={vote}
                roomRemove={roomRemove}
            />

            {playerData && (gameTime === 0 || gameTime === 4) && (
                <ThemeSelector
                    patternList={patternList}
                    changeRadio={changeRadio}
                />
            )}

            {/* 議論中の制限時間 */}
            {playerData && (gameTime === 0 || gameTime === 4) && (
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
