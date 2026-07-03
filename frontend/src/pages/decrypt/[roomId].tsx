import React from 'react';
import { useRouter } from 'next/router';
import { SystemConst } from '../../const/next.config';
import Layout from '../../components/layout';
import Head from 'next/head';
import Chatmessage from '../../components/message/chatmessage';
import ChatComponent from '../../components/chatcomponent';
import styles from '../../styles/components/decrypt/room.module.scss';
import Router from 'next/router';

import Start from '../../components/common/Start';
import TeamDataInfo from '../../components/decrypt/teamDataInfo';
import type {
    DecryptUser as LegacyDecryptUser,
    TeamData,
} from '../../type/decrypt';
import ConnectionStatus from '../../components/common/ConnectionStatus';
import { useDecryptRoom } from '../../features/decrypt/useDecryptRoom';

export default function DecryptRoom() {
    // roomId取得
    const router = useRouter();
    const { roomId } = router.query;

    const {
        state,
        status,
        entered,
        roomIn,
        chat,
        resetCode,
        resetTeam,
        choiceTeam,
        modeChange,
        init,
    } = useDecryptRoom(roomId as string | undefined);

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
                        background: url(/images/decrypt/decryptbackground2.png);
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
                        '/images/decrypt/decryptbackground2.png'
                    }
                />
                <meta property="og:title" content="ディクリプト" />
                <meta
                    property="og:description"
                    content="ディクリプト　暗号解読ゲーム"
                />
                <title>ディクリプト</title>
            </Head>
            {/* 開始合図 */}
            {state.startFlg && <Start />}

            {/* メッセージエリア */}
            {state.messageList.map((value, index) => {
                if (index === state.messageList.length - 1) {
                    return (
                        <Chatmessage value={value} type="info" key={index} />
                    );
                }
            })}

            <ConnectionStatus status={status} />
            <div className={`${styles.roominbtn} ${entered ? styles.in : ''}`}>
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
                />
                <button
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

            {/* チームデータ */}
            {state.playerData && (
                <TeamDataInfo
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    userList={state.userList as any as LegacyDecryptUser[]}
                    leftTeam={state.leftTeam as TeamData}
                    rightTeam={state.rightTeam as TeamData}
                    turn={state.turn}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    playerData={state.playerData as any as LegacyDecryptUser}
                    gameTime={state.gameTime}
                    resetCode={resetCode}
                    resetTeam={resetTeam}
                    choiceTeam={choiceTeam}
                    modeChange={modeChange}
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
                    {state.turn > 0 && state.turn < 4
                        ? 'GAME RESET'
                        : 'GAME START'}
                </button>
            </div>

            {/* チャットのやり取り（機能OFF） */}
            {false && (
                <ChatComponent chatList={state.chatList} chat={chat} />
            )}

            <div className={styles.rulebtn}>
                <button>遊び方</button>
            </div>
        </Layout>
    );
}
