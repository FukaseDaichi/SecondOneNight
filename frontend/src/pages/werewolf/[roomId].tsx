/* eslint-disable no-irregular-whitespace */
import React from 'react';
import { useRouter } from 'next/router';
import SockJsClient from 'react-stomp';
import { SystemConst } from '../../const/next.config';
import Layout from '../../components/layout';
import Head from 'next/head';
import { SocketInfo } from '../../type';
import Chatmessage from '../../components/message/chatmessage';
import { useEffect, useState, useCallback } from 'react';
import ChatComponent from '../../components/chatcomponent';
import UserInfo from '../../components/werewolf/userInfo';
import styles from '../../styles/components/werewolf/room.module.scss';
import Router from 'next/router';
import Start from '../../components/timebomb/start';
import RollCard from '../../components/werewolf/rollcard';
import ModalRollCard from '../../components/werewolf/modalrollcard';
import RollInfo from '../../components/werewolf/rollinfo';
import RollSelectTurn from '../../components/werewolf/rollselectturn';
import CutIn from '../../components/werewolf/cutin';
import WerewolfSet from '../../components/werewolf/werewolfset';
import Rule from '../../components/werewolf/rule';
import Result from '../../components/werewolf/result';
import Countdown from '../../components/werewolf/countdown';
import { WerewolfRoll, WerewolfUser } from '../../type/werewolf';
import Modal from '../../components/modal';
import CircleBtn from '../../components/button/circlebtn';
import Loadingdod from '../../components/text/loadingdod';
import Socialbtn from '../../components/button/sosialbtn';

// 接続切れ
const disconnect = () => {
    console.log('接続が切れました');
};

// 情報設定
const setRollCustum = (rollNoList: Array<number>) => {
    if (!rollNoList) {
        return;
    }

    const maxRollNo = Math.max(...rollNoList);

    for (let i = 1; i <= maxRollNo; i++) {
        const cunterDom = document.getElementById('cunter_' + i);
        if (cunterDom) {
            cunterDom.textContent = String(
                rollNoList.filter((element) => {
                    return element === i;
                }).length
            );
        }
    }
};

// 役職設定用のカウンター
const cunter = (rollNo: number, plusFlg: boolean) => {
    const cunterDom = document.getElementById('cunter_' + rollNo);
    if (cunterDom) {
        let value = Number(cunterDom.textContent);
        if (plusFlg) {
            if (value < 15) {
                value++;
            }
        } else {
            if (value > 0) {
                value--;
            }
        }
        cunterDom.innerHTML = String(value);
    }
};

export default function WerewolfRoom(): JSX.Element {
    // roomId取得
    const router = useRouter();
    const { roomId } = router.query;

    const [clientObj, setClientObj] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messageList, setMessageList] = useState([]);
    const [playerName, setPlayerName] = useState(null);
    const [chatList, setChatList] = useState([]);

    // gamedata
    const [userList, setUserLst] = useState([]);
    const [turn, setTurn] = useState(0);
    const [winteamList, setWinteamList] = useState([]);
    const [staticRollList, setStaticRollList] = useState([]);
    const [rollList, setRollList] = useState([]);
    const [playerData, setPlayerData] = useState(null);
    const [npcuser, setNpcuser] = useState(null);
    const [limitTime, setLimitTime] = useState(0);

    // view
    const [startFlg, setStartFlg] = useState(false);
    const [modalRoll, setModalRoll] = useState(null);
    const [rollSelectTurnFlg, setRollSelectTurnFlg] = useState(false);
    const [playerActionName, setPlayerActionName] = useState(null);
    const [playerNPCActionName, setPlayerNPCActionName] = useState(null);
    const [votingStartFlg, setVotingStartFlg] = useState(false);
    const [cutInNo, setCutInNo] = useState(0);
    const [resultFlg, setResultFlg] = useState(false);
    const [ruleFlg, setRuleFlg] = useState(false);
    const [winMessage, setWinmessage] = useState(null);
    const [modalOwnFlg, setModalOwnFlg] = useState(false);
    const [rollInfoList, setRollInfoList] = useState([]);

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
            if (playerName) {
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

    // 役職設定
    const setRoll = () => {
        const url = '/app/werewolf-setrollregulation';

        const intList: Array<number> = [];
        staticRollList.forEach((element: WerewolfRoll) => {
            const cunterDom = document.getElementById(
                'cunter_' + element.rollNo
            );
            if (cunterDom) {
                const rollsize = Number(cunterDom.textContent);
                for (let i = 0; i < rollsize; i++) {
                    intList.push(element.rollNo);
                }
            }
        });

        const soketInfo: SocketInfo = {
            status: 150,
            roomId: roomId as string,
            userName: playerName,
            message: null,
            obj: intList,
        };
        conect(url, soketInfo);
    };

    // 役職設定
    const setRollSet = useCallback(
        (rollNoList: Array<number>) => {
            const url = '/app/werewolf-setrollregulation';

            const soketInfo: SocketInfo = {
                status: 150,
                roomId: roomId as string,
                userName: playerName,
                message: null,
                obj: rollNoList,
            };
            conect(url, soketInfo);
        },
        [playerName]
    );

    // ゲーム開始
    const init = () => {
        const url = '/app/werewolf-init';
        const soketInfo: SocketInfo = {
            status: 300,
            roomId: roomId as string,
            userName: playerName,
            message: null,
            obj: null,
        };
        conect(url, soketInfo);
    };

    // 役職選択
    const selectRoll = useCallback(
        (rollIndex: number) => {
            const url = '/app/werewolf-selectroll';
            const soketInfo: SocketInfo = {
                status: 400,
                roomId: roomId as string,
                userName: playerName,
                message: null,
                obj: rollIndex,
            };
            conect(url, soketInfo);
        },
        [playerName]
    );

    // 議論中アクション
    const discussionAction = useCallback(
        (targetUsername: string) => {
            const url = '/app/werewolf-discussionaction';

            const stringList: Array<string> = [];
            stringList.push(playerName);
            stringList.push(targetUsername);

            const soketInfo: SocketInfo = {
                status: 500,
                roomId: roomId as string,
                userName: playerName,
                message: null,
                obj: stringList,
            };
            conect(url, soketInfo);
        },
        [playerName]
    );

    const userAction = useCallback(
        (targetUsername: string) => {
            if (turn === 2) {
                // 議論中の場合
                discussionAction(targetUsername);
            } else if (turn === 3) {
                // 投票中の場合
                voting(targetUsername);
            } else {
                return;
            }
        },
        [turn]
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

    // 投票
    const voting = useCallback(
        (targetUsername: string) => {
            const url = '/app/werewolf-voting';
            const soketInfo: SocketInfo = {
                status: 700,
                roomId: roomId as string,
                userName: playerName,
                message: null,
                obj: targetUsername,
            };
            conect(url, soketInfo);
        },
        [playerName]
    );

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
        //console.log(socketInfo);

        switch (socketInfo.status) {
            case 100: // ルーム入室
                dataSet(socketInfo.obj);
                setLimitTime(socketInfo.obj.limitTime);
                setRollCustum(socketInfo.obj.rollNoList);
                setRollInfoList(socketInfo.obj.rollList);
                break;

            case 101: {
                // チャット
                setChatList(socketInfo.obj);
                const messageFirld = document.getElementById('chat-firld');
                messageFirld.scrollTop = messageFirld.scrollHeight;
                break;
            }
            case 150: // 役職設定
                dataSet(socketInfo.obj);
                setRollCustum(socketInfo.obj.rollNoList);
                setRollInfoList(socketInfo.obj.rollList);
                break;

            case 200:
                // ルーム入室(同一名ユーザ入室)
                dataSet(socketInfo.obj);
                setLimitTime(socketInfo.obj.limitTime);
                setRollCustum(socketInfo.obj.rollNoList);
                setRollInfoList(socketInfo.obj.rollList);
                break;

            case 300: // ゲーム開始
                // ゲームスタート
                setStartFlg(true);
                setRuleFlg(false);
                setResultFlg(false);
                dataSet(socketInfo.obj);
                break;

            case 400: // 役職選択
                dataSet(socketInfo.obj);
                break;

            case 404: // 例外
                setMessageList(messageList.concat(socketInfo.message));
                break;

            case 500: {
                // 議論アクション
                dataSet(socketInfo.obj);

                const userIndex = Number(socketInfo.message);
                const actionUser: WerewolfUser =
                    socketInfo.obj.userList[userIndex];

                // 怪盗の場合
                if ('怪盗した。' === actionUser.lastMessage) {
                    if (actionUser.userName === playerName) {
                        setCutInNo(11);
                    }
                    break;
                }

                // アクション
                if (actionUser) {
                    switch (actionUser.roll.rollNo) {
                        // 独裁者
                        case 6: {
                            setCutInNo(6);
                            //銃声
                            const audio = new Audio('/se/snip.mp3');
                            audio.play();
                            break;
                        }
                        // 占い師
                        case 8:
                            // 同一ユーザなら表示
                            if (actionUser.userName === playerName) {
                                setCutInNo(8);
                            }
                            break;

                        // 付き人
                        case 9:
                            // 同一ユーザなら表示
                            if (actionUser.userName === playerName) {
                                setCutInNo(9);
                            }
                            break;

                        //  暗殺者
                        case 10: {
                            setCutInNo(10);
                            //銃声
                            const audio = new Audio('/se/snip.mp3');
                            audio.play();
                            break;
                        }
                    }
                }
                break;
            }
            case 550: // 制限時間変更
                setLimitTime(socketInfo.obj);
                break;

            case 600: // ターン変更
                dataSet(socketInfo.obj);
                break;

            case 650: // アイコン変更
                setUserLst(socketInfo.obj);
                break;

            case 700: // 投票
                dataSet(socketInfo.obj);

                //終了時に設定を反映
                setRollCustum(socketInfo.obj.rollNoList);
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
        setWinteamList(obj.winteamList);
        setTurn(obj.turn);
        setStaticRollList(obj.staticRollList);
        setRollList(obj.rollList);
        setNpcuser(obj.npcuser);
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

    // 投票フラグの監視
    useEffect(() => {
        if (votingStartFlg) {
            window.setTimeout(() => {
                setVotingStartFlg(false);
            }, 4000);
        }
    }, [votingStartFlg]);

    // 勝敗監視
    useEffect(() => {
        if (winteamList.length === 0) {
            setWinmessage(null);
        } else {
            const winnner: number = winteamList[0];
            let message = null;
            switch (winnner) {
                case 1:
                    message = '人狼陣営';
                    break;
                case 2:
                    message = '村人陣営';
                    break;
                case 3:
                    message = 'てるてる';
                    break;
            }

            setTimeout(() => {
                scrollTo(0, 0);
                setWinmessage(message);
            }, 3000);
        }
    }, [winteamList.length]);

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

    // プレイヤーアクション名
    useEffect(() => {
        let actionName = null;
        let actionNPCName = null;
        if (playerData && playerData.roll) {
            if (
                turn === 2 &&
                playerData.roll.actionName &&
                playerData.roll.discussionActionCount < 1
            ) {
                if (playerData.roll.rollNo === 11) {
                    //処理なし
                } else {
                    actionName = playerData.roll.actionName;
                }
                actionNPCName = playerData.roll.actionName;
            } else if (turn === 3) {
                if (
                    playerData.roll.votingAbleFlg &&
                    playerData.votingUserName === null
                ) {
                    actionName = '投票';
                    actionNPCName = '投票';
                }
            }
        }
        setPlayerActionName(actionName);
        setPlayerNPCActionName(actionNPCName);
    }, [playerData, turn]);

    // 役職選択表示制御
    useEffect(() => {
        if (turn === 1) {
            setRollSelectTurnFlg(true);
        } else if (rollSelectTurnFlg && turn === 2) {
            setTimeout(() => {
                setRollSelectTurnFlg(false);
            }, 4000);
        } else {
            setRollSelectTurnFlg(false);
        }
    }, [turn, rollSelectTurnFlg]);

    // 投票メッセージ
    useEffect(() => {
        if (turn === 3) {
            setVotingStartFlg(true);
        } else {
            setVotingStartFlg(false);
        }
    }, [turn]);

    // カットイン
    useEffect(() => {
        if (cutInNo > 0) {
            setTimeout(() => {
                setCutInNo(0);
            }, 4000);
        }
    }, [cutInNo]);

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
            <SockJsClient
                url={SystemConst.Server.AP_HOST + SystemConst.Server.ENDPOINT}
                topics={['/topic/' + roomId]}
                ref={(client) => {
                    setClientObj(client);
                }}
                onConnect={() => {
                    setIsConnected(true);
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
                    disabled={!isConnected}
                />
                <button
                    onClick={() => {
                        const usernameDom: HTMLInputElement =
                            document.getElementById(
                                'username'
                            ) as HTMLInputElement;
                        roomIn(usernameDom.value);
                    }}
                    disabled={!isConnected}
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
                                                cunter(element.rollNo, false);
                                            }}
                                        >
                                            -
                                        </div>
                                        <div
                                            className={styles.number}
                                            id={'cunter_' + element.rollNo}
                                        >
                                            0
                                        </div>
                                        <div
                                            className={styles.counterbtn}
                                            onClick={() => {
                                                cunter(element.rollNo, true);
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
