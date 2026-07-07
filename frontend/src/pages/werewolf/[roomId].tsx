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
import StatusCard from '../../features/werewolf/components/StatusCard';
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
                    /* スマホでの横パン防止。clip は hidden と違い
                       スクロールコンテナ化しないため iOS でも確実に効く
                       (未対応ブラウザは直前の hidden にフォールバック) */
                    html,
                    body {
                        overflow-x: hidden;
                        overflow-x: clip;
                    }
                    body {
                        background-color: #eefaf9;
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
            {/* 待機中は桜色の花びら(勝利演出中は celebration 側に譲る) */}
            {lobby && !victoryVisible && <SakuraParticles mode="ambient" />}
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

            {/* ページ本文(中央カラム)。ロビー中は下部固定バーの分だけ余白を取る */}
            <div className={`${styles.room} ${lobby ? styles.lobbyRoom : ''}`}>
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
                {/* ロビーヘッダー: タイトル + 状態バッジ */}
                {lobby && (
                    <header className={styles.lobbyHeader}>
                        <div>
                            <p className={styles.lobbyEyebrow}>
                                SECOND ONE NIGHT WEREWOLF
                            </p>
                            <h1 className={styles.lobbyTitle}>ルーム設定</h1>
                        </div>
                        <span
                            className={`${styles.statusBadge} ${
                                readiness.ready ? styles.ready : ''
                            }`}
                        >
                            {readiness.ready ? '開始できます' : '参加待ち'}
                        </span>
                    </header>
                )}
                {/* 招待カード + 開始ステータスカードの2カラム */}
                {lobby && (
                    <div className={styles.heroRow}>
                        <InvitePanel
                            roomId={roomId as string}
                            roomCode={roomCode}
                            onShowRule={() => setRuleFlg(true)}
                        />
                        <StatusCard
                            count={userList.length}
                            max={10}
                            min={3}
                            ready={readiness.ready}
                            messages={readiness.messages}
                            onStart={init}
                        />
                    </div>
                )}
                {/* プレイヤーセクション見出し */}
                {lobby && (
                    <div className={styles.sectionHead}>
                        <p className={styles.sectionEyebrow}>PLAYERS</p>
                        <h2 className={styles.sectionTitle}>集いし者たち</h2>
                    </div>
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

                {/* お品書き(設定統合パネル) + 下部固定バー(退出 / GAME START) */}
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
                        />
                        <div className={styles.bottomBar}>
                            <button
                                className={styles.ghost}
                                onClick={() => {
                                    if (
                                        window.confirm('部屋から退出しますか?')
                                    ) {
                                        leaveRoom();
                                    }
                                }}
                            >
                                退出
                            </button>
                            <button
                                className={styles.primary}
                                onClick={init}
                                disabled={!readiness.ready}
                                title={
                                    !readiness.ready
                                        ? readiness.messages.join(' / ')
                                        : undefined
                                }
                            >
                                GAME START
                            </button>
                        </div>
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
