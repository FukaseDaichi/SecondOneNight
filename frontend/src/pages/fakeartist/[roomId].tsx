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
import styles from '../../styles/components/fakeartist/room.module.scss';
import Router from 'next/router';

import Start from '../../components/timebomb/start';
import Canvas from '../../components/fakeartist/canvas';
import { ArtDataStroke, FakeArtistUser } from '../../type/fakeartist';
import FakeartistUserInfo from '../../components/fakeartist/fakeartistuserInfo';
import Countdown from '../../components/werewolf/countdown';
import Loadingdod from '../../components/text/loadingdod';
import Modal from '../../components/modal';
import UserInfoShort from '../../components/fakeartist/userInfoshort';
import RadioChips from '../../components/chips/radiochips';
import HeaderInfo from '../../components/fakeartist/headInfo';
import CountdownClock from '../../components/clock/countdownClock';
import Socialbtn from '../../components/button/sosialbtn';

// 接続切れ
const disconnect = () => {
    console.log('接続が切れました');
};

// sleeep
const sleep = (msec: number) => {
    return new Promise((resolve) => setTimeout(resolve, msec));
};

// お絵描きコールバック
const callBackDraw = (artDataStroke: ArtDataStroke) => {
    const canvas: HTMLCanvasElement = document.querySelector('#draw-area');
    if (!canvas) {
        return;
    }
    const context = canvas.getContext('2d');

    context.beginPath();

    for (let i = 0; i < artDataStroke.artDataList.length - 1; i++) {
        context.lineCap = 'round'; // 丸みを帯びた線にする
        context.lineJoin = 'round'; // 丸みを帯びた線にする
        context.lineWidth = artDataStroke.lineWidth; // 線の太さ
        context.strokeStyle = artDataStroke.color; // 線の色

        context.moveTo(
            artDataStroke.artDataList[i].xparamPotision,
            artDataStroke.artDataList[i].yparamPotision
        );
        context.lineTo(
            artDataStroke.artDataList[i + 1].xparamPotision,
            artDataStroke.artDataList[i + 1].yparamPotision
        );
        context.stroke();
    }

    context.closePath();
};

// canvas上に書いた絵を全部消す
const clear = () => {
    const canvas: HTMLCanvasElement = document.querySelector('#draw-area');
    if (!canvas) {
        return;
    }
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const drawCanvas = (artDataStrokeArray: Array<any>) => {
    artDataStrokeArray.forEach((obj) => {
        callBackDraw(obj);
    });
};

// セカンドキャンパスの描画
const drawPersonCanvas = (
    artDataStrokeArray: Array<ArtDataStroke>,
    userName: string
) => {
    const canvas: HTMLCanvasElement =
        document.querySelector('#person-draw-area');
    if (!canvas) {
        return;
    }
    const context = canvas.getContext('2d');

    //既存削除
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (const artDataStroke of artDataStrokeArray) {
        if (artDataStroke.name === userName) {
            context.beginPath();
            for (let i = 0; i < artDataStroke.artDataList.length - 1; i++) {
                context.lineCap = 'round'; // 丸みを帯びた線にする
                context.lineJoin = 'round'; // 丸みを帯びた線にする
                context.lineWidth = artDataStroke.lineWidth; // 線の太さ
                context.strokeStyle = artDataStroke.color; // 線の色

                context.moveTo(
                    artDataStroke.artDataList[i].xparamPotision,
                    artDataStroke.artDataList[i].yparamPotision
                );
                context.lineTo(
                    artDataStroke.artDataList[i + 1].xparamPotision,
                    artDataStroke.artDataList[i + 1].yparamPotision
                );
                context.stroke();
            }
            context.closePath();
        }
    }
};

export default function FakeArtistRoom(): JSX.Element {
    // roomId取得
    const router = useRouter();
    const { roomId } = router.query;

    const [clientObj, setClientObj] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messageList, setMessageList] = useState([]);
    const [chatList, setChatList] = useState([]);

    // gamedata
    const [userList, setUserLst] = useState([]);
    const [gameTime, setGameTime] = useState(0);
    const [turn, setTurn] = useState(0);
    const [limitTime, setLimitTime] = useState(0);
    const [theme, setTheme] = useState('');
    const [artDataStrokeList, setArtDataStrokeList] = useState([]);
    const [endMessage, setEndMessage] = useState('');
    const [patternList, setPatternList] = useState([]);

    // userInfo
    const [playerName, setPlayerName] = useState(null);
    const [playerData, setPlayerData] = useState<FakeArtistUser>(null);

    // view
    const [startFlg, setStartFlg] = useState(false);
    const [disscuttionStartFlg, setDisscuttionStartFlg] = useState(false);
    const [votingStartFlg, setVotingStartFlg] = useState(false);
    const [personCanvasZindex, setPersonCanvasZindex] = useState(-1);
    const [endFlg, setEndFlg] = useState(false);

    // 個人描画削除
    const personCanpasMouseUp = useCallback(() => {
        setPersonCanvasZindex(-1);
    }, [gameTime]);

    const personCanpasMouseDown = useCallback(
        (userName: string) => {
            setPersonCanvasZindex(1);
            drawPersonCanvas(artDataStrokeList, userName);
        },
        [artDataStrokeList]
    );

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

    // テーマ変更
    const changeRadio = useCallback(
        (patternNo: number) => {
            let dataList = [];
            if (patternList.includes(patternNo)) {
                dataList = patternList.filter((no) => no !== patternNo);
            } else {
                dataList = [...patternList, patternNo];
            }
            const url = '/app/fakeartist-setpattern';

            const soketInfo: SocketInfo = {
                status: 160,
                roomId: roomId as string,
                userName: playerName,
                message: null,
                obj: dataList,
            };
            conect(url, soketInfo);
        },
        [playerName, patternList]
    );

    // ルーム退出
    const roomRemove = (userName: string) => {
        if (userName === '') {
            return;
        }
        const url = '/app/game-removeuser';
        const soketInfo: SocketInfo = {
            status: 150,
            roomId: roomId as string,
            userName: userName,
            message: null,
            obj: userName,
        };
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

    // ゲーム開始
    const init = useCallback(() => {
        const url = '/app/fakeartist-init';
        const soketInfo: SocketInfo = {
            status: 300,
            roomId: roomId as string,
            userName: playerName,
            message: null,
            obj: null,
        };
        conect(url, soketInfo);
    }, [playerName]);

    // お絵描き
    const draw = useCallback(
        (artDataStroke: ArtDataStroke) => {
            artDataStroke.name = playerName;
            const url = '/app/fakeartist-drawing';
            const soketInfo: SocketInfo = {
                status: 450,
                roomId: roomId as string,
                userName: playerName,
                message: null,
                obj: artDataStroke,
            };
            conect(url, soketInfo);
        },
        [playerName]
    );

    // 投票
    const vote = useCallback(
        (targetUsername: string) => {
            const url = '/app/fakeartist-voting';
            console.log(gameTime);
            const soketInfo: SocketInfo = {
                status: 500,
                roomId: roomId as string,
                userName: playerName,
                message: null,
                obj: targetUsername,
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
        if (gameTime === 2) {
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
    }, [gameTime]);

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
        //onsole.log(socketInfo);

        switch (socketInfo.status) {
            case 100: // ルーム入室
                dataSet(socketInfo.obj);

                // 初回入室時
                if (socketInfo.userName === playerName) {
                    // 既存キャンパスの反映
                    drawCanvas(socketInfo.obj.artDataStrokeList);
                }
                break;

            case 101: {
                // チャット
                setChatList(socketInfo.obj);
                const messageFirld = document.getElementById('chat-firld');
                messageFirld.scrollTop = messageFirld.scrollHeight;
                break;
            }

            case 150: // ルーム退出
                dataSet(socketInfo.obj);
                if (playerName === socketInfo.userName) {
                    setPlayerData(null);
                    const btnDom = document.querySelector(
                        '.' + styles.roominbtn
                    );
                    if (btnDom.classList.contains(styles.in)) {
                        btnDom.classList.remove(styles.in);
                    }
                }
                break;

            case 160: //テーマ変更
                setPatternList(socketInfo.obj.patternList);
                break;

            case 200: // 同一ユーザ入室(再入室)
                dataSet(socketInfo.obj);
                setMessageList(() => messageList.concat(socketInfo.message));

                // 初回入室時
                if (socketInfo.userName === playerName) {
                    // 既存キャンパスの反映
                    drawCanvas(socketInfo.obj.artDataStrokeList);
                }
                break;

            case 300: // ゲーム開始
                // ゲームスタート
                setStartFlg(true);
                // キャンパス初期化
                dataSet(socketInfo.obj);

                // 画面描画リセット
                clear();
                setPersonCanvasZindex(-1);
                setDisscuttionStartFlg(false);
                setVotingStartFlg(false);
                setEndFlg(false);

                break;

            case 404: // 例外
                setMessageList(messageList.concat(socketInfo.message));
                break;

            case 450: {
                // お絵描き

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const drawData: Array<any> = socketInfo.obj.artDataStrokeList;

                // 別の人の絵を反映
                if (socketInfo.userName !== playerName) {
                    callBackDraw(drawData[drawData.length - 1]);
                }

                // エンドフラグがある場合反映
                if (drawData[drawData.length - 1].endFlg) {
                    dataSet(socketInfo.obj);
                    setArtDataStrokeList(drawData);
                }
                break;
            }
            case 451: // お絵描き（通常）
                break;

            case 500: {
                // 投票
                dataSet(socketInfo.obj);

                if (socketInfo.obj.gameTime == 4) {
                    //終了時、画面にメッセージ表示
                    if (document.documentElement.clientWidth < 769) {
                        window.setTimeout(() => {
                            setEndFlg(true);
                        }, 3000);
                    }
                }
                break;
            }
            case 550: // 制限時間変更
                setLimitTime(socketInfo.obj);
                break;

            case 600: // 制限時間超過
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
        setTheme(obj.theme);
        setEndMessage(obj.endMessage);
        setPatternList(obj.patternList);
        setLimitTime(obj.limitTime);
    };

    // ゲーム監視
    useEffect(() => {
        if (gameTime === 2) {
            setDisscuttionStartFlg(true);
        } else if (gameTime === 3) {
            setVotingStartFlg(true);
        }
    }, [gameTime]);

    // スタートフラグの監視
    useEffect(() => {
        if (startFlg) {
            const headerDom = document.querySelector(
                '.fakeartistcheck'
            ) as HTMLInputElement;
            if (headerDom) {
                headerDom.checked = false;
            }

            scrollTo(0, 0);
            window.setTimeout(() => {
                setStartFlg(false);
                clear();

                if (document.documentElement.clientWidth < 769) {
                    window.setTimeout(() => {
                        const headerDomCheck = document.querySelector(
                            '.fakeartistcheck'
                        ) as HTMLInputElement;
                        if (headerDomCheck) {
                            headerDomCheck.checked = true;
                        }
                    }, 500);
                }
            }, 4000);
        }
    }, [startFlg]);

    // 議論開始フラグの監視
    useEffect(() => {
        if (disscuttionStartFlg) {
            window.setTimeout(() => {
                setDisscuttionStartFlg(false);
            }, 3500);
        }
    }, [disscuttionStartFlg]);

    // 投票フラグの監視
    useEffect(() => {
        if (votingStartFlg) {
            // ヘッダーをオフ
            const headerDom = document.querySelector(
                '.fakeartistcheck'
            ) as HTMLInputElement;
            if (headerDom) {
                headerDom.checked = false;
            }

            window.setTimeout(() => {
                setVotingStartFlg(false);
            }, 3500);
        }
    }, [votingStartFlg]);

    // 終了フラグの監視
    useEffect(() => {
        if (endFlg) {
            window.setTimeout(() => {
                setEndFlg(false);
            }, 3500);
        }
    }, [endFlg]);

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

            <SockJsClient
                url={SystemConst.Server.AP_HOST + SystemConst.Server.ENDPOINT}
                topics={['/topic/' + roomId]}
                ref={(client) => {
                    setClientObj(client);
                }}
                onMessage={(msg) => {
                    getMessage(msg);
                }}
                onConnect={() => {
                    setIsConnected(true);
                }}
                onDisconnect={disconnect}
            />
            <div className={styles.roominbtn}>
                <p>
                    <label htmlFor="username">Name</label>
                </p>
                <input
                    disabled={!isConnected}
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
                    disabled={!isConnected}
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
