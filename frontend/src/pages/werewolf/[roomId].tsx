import React from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { SystemConst } from '../../const/next.config';
import Layout from '../../components/layout';
import Head from 'next/head';
import Chatmessage from '../../components/message/chatmessage';
import ChatComponent from '../../components/chatcomponent';
import styles from '../../styles/components/werewolf/room.module.scss';
import Router from 'next/router';
import RollInfo from '../../features/werewolf/components/rollinfo';
import Socialbtn from '../../components/button/sosialbtn';
import ConnectionStatus from '../../components/common/ConnectionStatus';
import EntryCard from '../../features/werewolf/components/EntryCard';
import InvitePanel from '../../features/werewolf/components/InvitePanel';
import TurnMessage from '../../features/werewolf/components/TurnMessage';
import LanternRow from '../../features/werewolf/components/LanternRow';
import MenuPanel from '../../features/werewolf/components/MenuPanel';
import Overlays from '../../features/werewolf/components/Overlays';
import UserField from '../../features/werewolf/components/UserField';
import PhaseBackground from '../../features/werewolf/components/PhaseBackground';
import VictoryOverlay from '../../features/werewolf/components/VictoryOverlay';
import { useWerewolfRoom } from '../../features/werewolf/useWerewolfRoom';
import { lobbyReadiness } from '../../features/werewolf/lobby';

const SakuraParticles = dynamic(
    () => import('../../components/common/SakuraParticles'),
    { ssr: false }
);

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
        leaveRoom,
        removeUser,
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
        ruleFlg,
        winMessage,
        roomCode,
    } = state;

    // 待機中(ロビー): turn 0 と、終了後にロビーへ戻った turn 4
    const lobby = entered && (turn === 0 || turn === 4);
    // 開始条件(3人以上 / 役職合計 > 人数 / 人狼系あり)。MenuPanel 内でも同じ純粋関数で表示する
    const readiness = lobbyReadiness(
        userList.length,
        counterMap,
        staticRollList
    );
    // 勝利演出: 全画面演出 → 結果テーブル → ロビー復帰(VictoryOverlay 内で遷移)
    const victoryVisible =
        turn === 4 && winteamList.length > 0 && winMessage != null;

    const actionButtons = (
        <div className={styles.btnarea}>
            {entered && (turn === 0 || turn === 4) ? (
                <button
                    className={styles.ghost}
                    onClick={() => {
                        if (window.confirm('部屋から退出しますか?')) {
                            leaveRoom();
                        }
                    }}
                >
                    退出
                </button>
            ) : (
                <button
                    className={styles.ghost}
                    onClick={() => {
                        Router.push('/');
                    }}
                >
                    HOME
                </button>
            )}
            <button
                className={styles.primary}
                onClick={init}
                disabled={lobby && !readiness.ready}
                title={
                    lobby && !readiness.ready
                        ? readiness.messages.join(' / ')
                        : undefined
                }
            >
                {turn > 0 && turn < 4 ? 'GAME RESET' : 'GAME START'}
            </button>
        </div>
    );

    return (
        <Layout home={false}>
            <style jsx global>
                {`
                    body {
                        overflow-x: hidden;
                        background-color: #2b2440;
                    }
                `}
            </style>
            <Head>
                <meta
                    property="og:image"
                    content={SystemConst.Server.SITE_URL + '/images/ogp.jpg'}
                />
                <meta property="og:title" content="セカンドワンナイト人狼" />
                <meta
                    property="og:description"
                    content="セカンドワンナイト人狼！　役職を選べる1日で終わる人狼ゲーム！ 初心者にもおすすめ！"
                />
                <title>セカンドワンナイト人狼</title>
            </Head>
            <PhaseBackground turn={turn} winteamList={winteamList} />
            {/* 待機中は夕暮れ色の花びら(勝利演出中は celebration 側に譲る) */}
            {lobby && !victoryVisible && <SakuraParticles mode="dusk" />}
            {victoryVisible && (
                <VictoryOverlay
                    winMessage={winMessage}
                    winteamList={winteamList}
                    userList={userList}
                    npcuser={npcuser}
                />
            )}
            <Overlays
                startFlg={startFlg}
                votingStartFlg={votingStartFlg}
                cutInNo={cutInNo}
                turn={turn}
                userList={userList}
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
                showRuleButton={!lobby}
            />

            {/* ページ本文(中央カラム) */}
            <div className={styles.room}>
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
                            <Chatmessage
                                value={value}
                                type="info"
                                key={index}
                            />
                        );
                    }
                })}
                <ConnectionStatus status={status} />
                <EntryCard
                    connected={connected}
                    entered={entered}
                    onRoomIn={roomIn}
                />
                {/* ヘッダーゾーン: ルームコードカード + 遊び方 → 提灯列(入室人数) */}
                {lobby && (
                    <div className={styles.lobbyHead}>
                        <InvitePanel
                            roomId={roomId as string}
                            roomCode={roomCode}
                        />
                        <button
                            className={styles.ruleLink}
                            onClick={() => setRuleFlg(true)}
                        >
                            遊び方
                        </button>
                    </div>
                )}
                {lobby && (
                    <LanternRow count={userList.length} max={10} min={3} />
                )}
                {/* プレイヤーグリッド */}
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
                        removeUser={removeUser}
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

                {/* お品書き(設定統合パネル) + GAME START / 退出 */}
                {playerData && lobby ? (
                    <>
                        <MenuPanel
                            userCount={userList.length}
                            counterMap={counterMap}
                            staticRollList={staticRollList}
                            counter={counter}
                            setRoll={setRoll}
                            setRollSet={setRollSet}
                            setModalRoll={setModalRoll}
                            setModalOwnFlg={setModalOwnFlg}
                            limitTime={limitTime}
                            changeLimitTime={changeLimitTime}
                            turn={turn}
                        />
                        {actionButtons}
                    </>
                ) : (
                    actionButtons
                )}
                {/* チャットのやり取り（機能OFF） */}
                {false && <ChatComponent chatList={chatList} chat={chat} />}
                <Socialbtn
                    url={SystemConst.Server.SITE_URL + '/werewolf/' + roomId}
                    title={'セカンドワンナイト人狼'}
                    via={
                        'セカンドワンナイト人狼　リアルタイムに能力が使えるオンラインならではのスタイリッシュアクション招待隠匿ゲーム！'
                    }
                />
            </div>
        </Layout>
    );
}
