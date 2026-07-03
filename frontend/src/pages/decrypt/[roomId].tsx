/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { useRouter } from 'next/router';
import SockJsClient from 'react-stomp';
import { SystemConst } from '../../const/next.config';
import Layout from '../../components/layout';
import Head from 'next/head';
import { SocketInfo } from '../../type';
import { useEffect, useState, useCallback } from 'react';
import Chatmessage from '../../components/message/chatmessage';
import ChatComponent from '../../components/chatcomponent';
import styles from '../../styles/components/decrypt/room.module.scss';
import Router from 'next/router';

import Start from '../../components/timebomb/start';
import TeamDataInfo from '../../components/decrypt/teamDataInfo';

// 接続切れ
const disconnect = () => {
    console.log('接続が切れました');
};

export default function DecryptRoom(): JSX.Element {
    // roomId取得
    const router = useRouter();
    const { roomId } = router.query;

    const [clientObj, setClientObj] = useState(null);
    const [messageList, setMessageList] = useState([]);
    const [chatList, setChatList] = useState([]);

    // gamedata
    const [userList, setUserLst] = useState([]);
    const [gameTime, setGameTime] = useState(0);
    const [turn, setTurn] = useState(0);
    const [choiceMode, setChoiceMode] = useState(0);
    const [winnerTeam, setWinnerTeam] = useState(0);
    const [leftTeam, setLeftTeam] = useState(null);
    const [rightTeam, setRightTeam] = useState(null);

    // userInfo
    const [playerName, setPlayerName] = useState(null);
    const [playerData, setPlayerData] = useState(null);

    // view
    const [startFlg, setStartFlg] = useState(false);

    // ルーム入室
    const roomIn = (userName: string) => {
        if (userName === '') {
            return;
        }
        const url = '/app/game-roomin';
        const soketInfo: SocketInfo = {
            status: 100,
            roomId: roomId as string,
            userName: userName,
            message: null,
            obj: null,
        };

        setPlayerName(userName);
        conect(url, soketInfo);
    };

    // アイコン変更
    const changeIcon = useCallback(
        (iconUrl: string) => {
            const url = '/app/game-changeIcon';
            const soketInfo: SocketInfo = {
                status: 650,
                roomId: roomId as string,
                userName: playerName,
                message: null,
                obj: iconUrl,
            };
            conect(url, soketInfo);
        },
        [clientObj, playerName]
    );

    // チャット
    const chat = useCallback(
        (message: string) => {
            if (playerData) {
                const url = '/app/game-chat';
                const soketInfo: SocketInfo = {
                    status: 101,
                    roomId: roomId as string,
                    userName: playerName,
                    message: message,
                    obj: null,
                };
                conect(url, soketInfo);
                setMessageList(messageList.concat(message));
            }
        },
        [playerName, messageList]
    );

    // 暗号リセット
    const resetCode = useCallback(() => {
        const url = '/app/decrypt-resetcode';

        const soketInfo: SocketInfo = {
            status: 110,
            roomId: roomId as string,
            userName: playerName,
            message: null,
            obj: null,
        };
        conect(url, soketInfo);
    }, [playerName]);

    // チームリセット
    const resetTeam = useCallback(() => {
        const url = '/app/decrypt-resetteam';

        const soketInfo: SocketInfo = {
            status: 120,
            roomId: roomId as string,
            userName: playerName,
            message: null,
            obj: null,
        };
        conect(url, soketInfo);
    }, [playerName]);

    // チーム選択
    const choiceTeam = useCallback(
        (teamNo: number) => {
            const url = '/app/decrypt-choiceteam';

            const soketInfo: SocketInfo = {
                status: 130,
                roomId: roomId as string,
                userName: playerName,
                message: null,
                obj: teamNo,
            };
            conect(url, soketInfo);
        },
        [playerName]
    );

    // モードチェンジ
    const modeChange = useCallback(
        (modeNo: number) => {
            const url = '/app/decrypt-modechange';

            const soketInfo: SocketInfo = {
                status: 140,
                roomId: roomId as string,
                userName: playerName,
                message: null,
                obj: modeNo,
            };
            conect(url, soketInfo);
        },
        [playerName]
    );

    // ゲーム開始
    const init = () => {
        const url = '/app/decrypt-init';
        const soketInfo: SocketInfo = {
            status: 300,
            roomId: roomId as string,
            userName: playerName,
            message: null,
            obj: null,
        };
        conect(url, soketInfo);
    };

    // 暗号作成者へ立候補
    const handupCreatecode = useCallback(() => {
        const url = '/app/decrypt-handupcreatecode';
        const soketInfo: SocketInfo = {
            status: 350,
            roomId: roomId as string,
            userName: playerName,
            message: null,
            obj: null,
        };
        conect(url, soketInfo);
    }, [playerName]);

    // 暗号作成
    const createCodeword = useCallback(
        (wordList: Array<string>) => {
            const url = '/app/decrypt-createcodeword';
            const soketInfo: SocketInfo = {
                status: 370,
                roomId: roomId as string,
                userName: playerName,
                message: null,
                obj: wordList,
            };
            conect(url, soketInfo);
        },
        [playerName]
    );

    // 解読
    const decryptCode = useCallback(
        (noList: Array<number>) => {
            const url = '/app/decrypt-decryptcode';

            const soketInfo: SocketInfo = {
                status: 500,
                roomId: roomId as string,
                userName: playerName,
                message: null,
                obj: noList,
            };
            conect(url, soketInfo);
        },
        [playerName]
    );

    // 制限時間変更
    const changeLimitTime = useCallback(
        (time: number) => {
            const url = '/app/game-setlimittime';
            const soketInfo: SocketInfo = {
                status: 550,
                roomId: roomId as string,
                userName: null,
                message: null,
                obj: time,
            };
            conect(url, soketInfo);
        },
        [playerName]
    );

    // 議論制限時間超過
    const limittimeDone = useCallback(() => {
        if (turn === 2) {
            const url = '/app/game-dooverLimit';
            const soketInfo: SocketInfo = {
                status: 600,
                roomId: roomId as string,
                userName: null,
                message: null,
                obj: turn,
            };
            conect(url, soketInfo);
        }
    }, [turn]);

    const conect = (url: string, soketInfo: SocketInfo) => {
        try {
            clientObj.sendMessage(url, JSON.stringify(soketInfo));
        } catch (e) {
            setMessageList(
                messageList.concat('通信エラー。再度試してください')
            );
        }
    };

    const getMessage = (socketInfo: SocketInfo) => {
        // デバッグ用
        console.log(socketInfo);

        switch (socketInfo.status) {
            case 100: // ルーム入室
                dataSet(socketInfo.obj);
                break;

            case 101: {
                // チャット
                setChatList(socketInfo.obj);
                const messageFirld = document.getElementById('chat-firld');
                messageFirld.scrollTop = messageFirld.scrollHeight;
                break;
            }
            case 110: // 暗号リセット
                dataSet(socketInfo.obj);
                break;

            case 120: // チームリセット
                dataSet(socketInfo.obj);
                break;

            case 130: // チーム選択
                dataSet(socketInfo.obj);
                break;

            case 140: // モードチェンジ
                dataSet(socketInfo.obj);
                break;

            case 200: // 同一ユーザ入室
                dataSet(socketInfo.obj);
                setMessageList(() => messageList.concat(socketInfo.message));
                break;

            case 300: // ゲーム開始
                // ゲームスタート
                setStartFlg(true);
                dataSet(socketInfo.obj);
                break;

            case 350: // 立候補
                dataSet(socketInfo.obj);
                break;

            case 370: // 暗号作成
                dataSet(socketInfo.obj);
                break;

            case 404: // 例外
                setMessageList(messageList.concat(socketInfo.message));
                break;

            case 500: // 解読
                dataSet(socketInfo.obj);
                break;

            case 650: // アイコン変更
                setUserLst(socketInfo.obj);
                break;

            case 998: // エラーメッセージ表示(個人)
                if (socketInfo.userName === playerName) {
                    setMessageList(messageList.concat(socketInfo.message));
                }
                break;

            case 999: // エラーメッセージ表示(全員)
                setMessageList(messageList.concat(socketInfo.message));
                break;

            default:
                console.log(socketInfo);
        }
    };

    // データセット
    const dataSet = (obj) => {
        setUserLst(obj.userList);
        setTurn(obj.turn);
        setGameTime(obj.gameTime);
        setChoiceMode(obj.choiceMode);
        setWinnerTeam(obj.winnerTeam);
        setLeftTeam(obj.leftTeam);
        setRightTeam(obj.rightTeam);
    };

    // スタートフラグの監視
    useEffect(() => {
        if (startFlg) {
            scrollTo(0, 0);
            window.setTimeout(() => {
                setStartFlg(false);
            }, 4000);
        }
    }, [startFlg]);

    // 勝敗監視
    useEffect(() => {
        if (winnerTeam === 0) {
            // 処理なし
        } else {
            // 処理なし
        }
    }, [winnerTeam]);

    // 入室時
    useEffect(() => {
        const userArray = userList.filter((element) => {
            return element.userName === playerName;
        });
        if (userArray.length > 0) {
            const btnDom = document.querySelector('.' + styles.roominbtn);
            if (btnDom.classList.contains(styles.in)) {
                return;
            }
            btnDom.classList.add(styles.in);

            // アイコン初期設定
            if (userArray[0].userIconUrl === null) {
                changeIcon('/images/icon/icon' + userArray[0].userNo + '.jpg');
            }
        }
    }, [userList.length, playerName]);

    // プレイヤーデータ設定
    useEffect(() => {
        const filterNameArray = userList.filter((element) => {
            return element.userName === playerName;
        });
        if (filterNameArray.length > 0) {
            setPlayerData(filterNameArray[0]);
        }
    }, [userList, playerName]);

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
            {startFlg && <Start />}

            {/* メッセージエリア */}
            {messageList.map((value, index) => {
                if (index === messageList.length - 1) {
                    return (
                        <Chatmessage value={value} type="info" key={index} />
                    );
                }
            })}

            <SockJsClient
                url={SystemConst.Server.AP_HOST + SystemConst.Server.ENDPOINT}
                topics={['/topic/' + roomId]}
                ref={(client) => {
                    setClientObj(client);
                }}
                onMessage={(msg) => {
                    getMessage(msg);
                }}
                onDisconnect={disconnect}
            />
            <div className={styles.roominbtn}>
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
            {playerData && (
                <TeamDataInfo
                    userList={userList}
                    leftTeam={leftTeam}
                    rightTeam={rightTeam}
                    turn={turn}
                    playerData={playerData}
                    gameTime={gameTime}
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
                    {turn > 0 && turn < 4 ? 'GAME RESET' : 'GAME START'}
                </button>
            </div>

            {/* チャットのやり取り（機能OFF） */}
            {false && <ChatComponent chatList={chatList} chat={chat} />}

            <div className={styles.rulebtn}>
                <button>遊び方</button>
            </div>
        </Layout>
    );
}
