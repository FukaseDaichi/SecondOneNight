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
import BuildCard from '../../components/hideout/buildcard';
import UserInfo from '../../components/hideout/userInfo';
import RushTurn from '../../components/hideout/rushturn';
import styles from '../../styles/components/hideout/room.module.scss';
import HideoutModal from '../../components/modal/hideoutmodal';
import HideoutHeadInfo from '../../components/hideout/hideoutheadinfo';
import GameInfo from '../../components/hideout/gameinfo';
import Router from 'next/router';
import Start from '../../components/timebomb/start';
import Socialbtn from '../../components/button/sosialbtn';

// 接続切れ
const disconnect = () => {
    console.log('接続が切れました');
};

export default function HideoutRoom(): JSX.Element {
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
    const [memberFirldList, setMemberFirldList] = useState([]);
    const [rushFlg, setRushFlg] = useState(false);
    const [firldBuilding, setFirldBuilding] = useState(null);
    const [waitUserIndexList, setWaitUserIndexList] = useState([]);
    const [memberCardList, setMemberCardList] = useState([]);
    const [buildingCardList, setBuildingCardList] = useState([]);
    const [winnerTeam, setWinnerTeam] = useState(0);
    const [turn, setTurn] = useState(0);

    // view
    const [viewMemberCardList, setViewMemberCardList] = useState([]);
    const [startFlg, setStartFlg] = useState(false);
    const [rushAreaFlg, setRushAreaFlg] = useState(false);
    const [swatWinFlg, setSwatWinFlg] = useState(false);
    const [terroristWinFlg, setTerroristWinFlg] = useState(false);

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

    // ゲーム開始
    const init = () => {
        const url = '/app/hideout-init';
        const soketInfo: SocketInfo = {
            status: 300,
            roomId: roomId as string,
            userName: playerName,
            message: null,
            obj: null,
        };
        conect(url, soketInfo);
    };

    const wait = (index: number) => {
        const url = '/app/hideout-wait';
        const soketInfo: SocketInfo = {
            status: 400,
            roomId: roomId as string,
            userName: playerName,
            message: null,
            obj: index,
        };
        conect(url, soketInfo);
    };

    const rush = (index: number) => {
        const url = '/app/hideout-rush';
        const soketInfo: SocketInfo = {
            status: 500,
            roomId: roomId as string,
            userName: playerName,
            message: null,
            obj: index,
        };
        conect(url, soketInfo);
    };

    // アイコン変更
    const changeIcon = useCallback(
        (iconUrl: string) => {
            const url = '/app/game-changeIcon';
            const soketInfo: SocketInfo = {
                status: 600,
                roomId: roomId as string,
                userName: playerName,
                message: null,
                obj: iconUrl,
            };
            conect(url, soketInfo);
        },
        [clientObj, playerName]
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
        //console.log(socketInfo);

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
            case 200:
                // ルーム入室(同一名ユーザ入室)
                dataSet(socketInfo.obj);
                break;

            case 300: // ゲーム開始
                setRushAreaFlg(false);
                // 勝敗リセット
                setTerroristWinFlg(false);
                setSwatWinFlg(false);

                // ゲームスタート
                setStartFlg(true);

                dataSet(socketInfo.obj);
                break;

            case 400: // ゲーム待機
                // 誰かが行動したらラッシュタイムを終了
                setRushAreaFlg(false);

                dataSet(socketInfo.obj);
                break;

            case 500: // 突入
                dataSet(socketInfo.obj);
                break;

            case 600: // アイコン変更
                setUserLst(socketInfo.obj);
                break;

            default:
                console.log(socketInfo);
        }
    };

    const dataSet = (obj) => {
        setUserLst(obj.userList);
        setRushFlg(obj.rushFlg);
        setFirldBuilding(obj.firldBuilding);
        setMemberFirldList(obj.memberFirldList);
        setWaitUserIndexList(obj.waitUserIndexList);
        setWinnerTeam(obj.winnerTeam);
        setMemberCardList(obj.memberCardList);
        setBuildingCardList(obj.buildingCardList);
        setTurn(obj.turn);
    };

    // ラッシュフラグの監視
    useEffect(() => {
        // ラッシュフラグがtrueのときに連動
        if (rushFlg) {
            scrollTo(0, 0);
            setRushAreaFlg(true);
        }
    }, [rushFlg]);

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
        // ラッシュフラグがtrueのときに連動
        switch (winnerTeam) {
            case 1:
                setSwatWinFlg(true);
                break;
            case 2:
                setTerroristWinFlg(true);
                break;
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

    // ヘッダ用情報更新
    useEffect(() => {
        setViewMemberCardList(memberCardList);
    }, [turn, rushFlg]);

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
            {startFlg && <Start />}

            {turn > 0 && (
                <HideoutHeadInfo
                    userList={userList}
                    memberCardList={viewMemberCardList}
                />
            )}
            {turn > 0 && (
                <GameInfo
                    buildingCardList={buildingCardList}
                    memberCardList={memberCardList}
                />
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
            {/* フィールド情報 */}
            {firldBuilding && (
                <div className={styles.firldBuild}>
                    <BuildCard
                        buildingCard={firldBuilding}
                        userList={userList}
                        wait={wait}
                        waitUserIndexList={waitUserIndexList}
                        ownFlg={false}
                    />
                </div>
            )}
            {/* ユーザ情報 */}
            <div className={styles.userfirld}>
                {userList.map((user, index: number) => {
                    return (
                        <UserInfo
                            key={index}
                            user={user}
                            ownFlg={user.userName === playerName}
                            userColor={SystemConst.PLAYER_COLOR_LIST[index]}
                            changeIcon={changeIcon}
                            userList={userList}
                            wait={wait}
                            winnerTeam={winnerTeam}
                            turn={turn}
                        />
                    );
                })}
            </div>
            {rushAreaFlg && (
                <RushTurn
                    userList={userList}
                    playerName={playerName}
                    rush={rush}
                    memberFirldList={memberFirldList}
                    endFnc={() => {
                        setRushAreaFlg(false);
                    }}
                />
            )}
            {!rushAreaFlg && terroristWinFlg && (
                <HideoutModal
                    type={'seven'}
                    endFnc={() => {
                        setTimeout(() => {
                            setTerroristWinFlg(false);
                        }, 3000);
                    }}
                >
                    <div className={styles.result}>
                        <img
                            src="/images/hideout/terroristwin.png"
                            alt="結果"
                        />
                    </div>
                </HideoutModal>
            )}
            {!rushAreaFlg && swatWinFlg && (
                <HideoutModal
                    type={'five'}
                    endFnc={() => {
                        setTimeout(() => {
                            setSwatWinFlg(false);
                        }, 3000);
                    }}
                >
                    <div className={styles.result}>
                        <img src="/images/hideout/swatwin.png" alt="結果" />
                    </div>
                </HideoutModal>
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
                    {turn > 0 ? 'GAME RESET' : 'GAME START'}
                </button>
            </div>
            {/* チャットのやり取り（機能OFF） */}
            {false && <ChatComponent chatList={chatList} chat={chat} />}
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
