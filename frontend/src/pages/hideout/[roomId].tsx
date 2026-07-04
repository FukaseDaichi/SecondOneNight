import React from 'react';
import { useRouter } from 'next/router';
import { SystemConst } from '../../const/next.config';
import Layout from '../../components/layout';
import Head from 'next/head';
import ChatComponent from '../../components/chatcomponent';
import styles from '../../styles/components/hideout/room.module.scss';
import Router from 'next/router';
import Start from '../../components/common/Start';
import Socialbtn from '../../components/button/sosialbtn';
import ConnectionStatus from '../../components/common/ConnectionStatus';
import RoomInForm from '../../components/common/RoomInForm';
import WinnerModals from '../../features/hideout/components/WinnerModals';
import GameInfoArea from '../../features/hideout/components/GameInfoArea';
import PlayArea from '../../features/hideout/components/PlayArea';
import { useHideoutRoom } from '../../features/hideout/useHideoutRoom';

export default function HideoutRoom() {
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
        init,
        wait,
        rush,
        changeIcon,
        closeRushArea,
        dismissSwatWin,
        dismissTerroristWin,
    } = useHideoutRoom(roomId as string | undefined);

    return (
        <Layout home={false}>
            <style jsx global>{`
                body {
                    background-image: url(/images/hideout/hideoutbackground.png);
                    background-attachment: fixed;
                    background-size: 370px;
                    background-position: bottom left;
                    background-repeat: no-repeat;
                    overflow-x: hidden;
                    background-color: #ecebeb;
                }
            `}</style>
            <Head>
                <meta name="robots" content="noindex, nofollow" />
                <meta
                    property="og:image"
                    content={
                        SystemConst.Server.SITE_URL +
                        '/images/hideout/hideoutbackground.png'
                    }
                />
                <meta property="og:title" content="ハイドアウトオンライン" />
                <meta
                    property="og:description"
                    content="オンライン上でみんなでハイドアウト！"
                />
                <title>Hideout</title>
            </Head>
            {/* 開始合図 */}
            {state.startFlg && <Start />}

            <GameInfoArea
                turn={state.turn}
                userList={state.userList}
                viewMemberCardList={state.viewMemberCardList}
                buildingCardList={state.buildingCardList}
                memberCardList={state.memberCardList}
                messageList={state.messageList}
            />
            <ConnectionStatus status={status} />
            <RoomInForm
                connected={connected}
                entered={entered}
                onRoomIn={roomIn}
                className={styles.roominbtn}
                enteredClassName={styles.in}
            />
            <PlayArea
                firldBuilding={state.firldBuilding}
                userList={state.userList}
                wait={wait}
                waitUserIndexList={state.waitUserIndexList}
                playerName={state.playerName}
                winnerTeam={state.winnerTeam}
                turn={state.turn}
                changeIcon={changeIcon}
                rushAreaFlg={state.rushAreaFlg}
                memberFirldList={state.memberFirldList}
                rush={rush}
                closeRushArea={closeRushArea}
            />
            <WinnerModals
                rushAreaFlg={state.rushAreaFlg}
                terroristWinFlg={state.terroristWinFlg}
                swatWinFlg={state.swatWinFlg}
                dismissTerroristWin={dismissTerroristWin}
                dismissSwatWin={dismissSwatWin}
            />
            <div className={styles.btnarea}>
                <button
                    onClick={() => {
                        Router.push('/');
                    }}
                >
                    HOME
                </button>
                <button onClick={init}>
                    {state.turn > 0 ? 'GAME RESET' : 'GAME START'}
                </button>
            </div>
            {/* チャットのやり取り（機能OFF） */}
            {false && <ChatComponent chatList={state.chatList} chat={chat} />}
            <div className={styles.rulebtn}>
                <button
                    onClick={() =>
                        window.open(
                            'https://image.gamemarket.jp/2019/09/HIDEOUT_rule.pdf'
                        )
                    }
                >
                    RULE official
                </button>
            </div>

            <Socialbtn
                url={SystemConst.Server.SITE_URL + '/hideout/' + roomId}
                title={'ハイドアウト'}
                via={
                    'ハイドアウトオンライン！　ゲームデザイナー佐藤雄介様の招待隠匿ゲーム'
                }
            />
        </Layout>
    );
}
