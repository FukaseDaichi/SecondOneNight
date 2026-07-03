import React from 'react';
import { useRouter } from 'next/router';
import SockJsClient from 'react-stomp';
import { SystemConst } from '../../const/next.config';
import Layout from '../../components/layout';
import Start from '../../components/timebomb/start';
import { useEffect, useState, useCallback } from 'react';
import { RoomUserInfo, TimeBombUser, LeadCards, SocketInfo } from '../../type';
import UserInfo from '../../components/timebomb/userInfo';
import Modal from '../../components/modal';
import Chatmessage from '../../components/message/chatmessage';
import styles from '../../styles/components/timebomb/room.module.scss';
import HeaderInfo from '../../components/timebomb/headInfo';
import CountdownClock from '../../components/countdownclock';
import Router from 'next/router';
import Head from 'next/head';
import Socialbtn from '../../components/button/sosialbtn';

// 接続切れ
const disconnect = () => {
    console.log('接続が切れました');
};

export default function Room(): JSX.Element {
    // roomId取得
    const router = useRouter();
    const { roomId } = router.query;

    // react hooks state
    const [clientObj, setClientObj] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [playerName, setPlayerName] = useState('');
    const [timeBombUserList, setTimeBombUserList] = useState([]);
    const [leadCardsList, setLeadCardsList] = useState([]);
    const [startFlg, setStartFlg] = useState(false);

    // メッセージ用データセット
    const [messageList, setMessageList] = useState([]);

    // ラウンドメッセージ用データセット
    const [round, setRound] = useState(0);
    const [roundMessageFlg, setRoundMessageFlg] = useState(false);

    // ゲーム内情報
    const [turn, setTurn] = useState(0);
    const [releaseNo, setReleaseNo] = useState(0);
    const [limitTime, setLimitTime] = useState(0);
    const [secretFlg, setSecretFlg] = useState(false);

    // 勝敗表示用
    const [endFlg, setEndFlg] = useState(false);
    const [bommerFlg, setBommerFlg] = useState(false);
    const [policeFlg, setPoliceFlg] = useState(false);

    // フラグの監視
    useEffect(() => {
        if (startFlg) {
            window.setTimeout(() => {
                setStartFlg(false);
            }, 4000);
        }

        if (roundMessageFlg) {
            window.setTimeout(() => {
                document.querySelector('body').classList.remove('modal_active');
                setRoundMessageFlg(false);
            }, 5000);
        }
    }, [startFlg, roundMessageFlg]);

    const coneect = (url: string, msg: RoomUserInfo) => {
        try {
            clientObj.sendMessage(url, JSON.stringify(msg));
        } catch (e) {
            setMessageList(
                messageList.concat('通信エラー。再度試してください')
            );
        }
    };
    // ルーム入室
    const roomIn = (msg: RoomUserInfo) => {
        const url = '/app/roomin';
        setPlayerName(msg.userName);
        coneect(url, msg);
    };

    // 初回入室時
    useEffect(() => {
        const userArray = timeBombUserList.filter((element) => {
            return element.userName === playerName;
        });

        if (userArray.length > 0) {
            const btnDom = document.querySelector('.' + styles.roominbtn);
            if (btnDom && btnDom.classList.contains(styles.in)) {
                return;
            }
            if (btnDom) {
                btnDom.classList.add(styles.in);
            }
        }
    }, [playerName, timeBombUserList.length]);

    // ゲームスタート
    const start = (msg: RoomUserInfo) => {
        const url = '/app/start';
        coneect(url, msg);
    };

    // メッセージ取得
    const receve = (msg) => {
        // エラーケース
        if (msg.status) {
            switch (msg.status) {
                case 200:
                    setMessageList(messageList.concat(msg.message));
                    setData(msg.obj);
                    return;
                case 201:
                    // アイコン変更時
                    setTimeBombUserList(msg.obj);
                    return;
                case 404:
                    setMessageList(messageList.concat(msg.message));
                    return;

                case 800:
                    setSecretFlg(msg.obj);
                    return;

                case 900:
                    // 制限時間変更
                    setLimitTime(msg.obj);
                    return;

                default:
                    setMessageList(messageList.concat(msg.message));
                    return;
            }
        }

        // 解除メッセージ判定
        if (releaseNo < msg.releaseNo) {
            setMessageList(messageList.concat('解除に成功'));
        }

        // データ設定
        setData(msg);

        // 開始判定
        if (msg.turn === 1) {
            // データリセット
            document.querySelector('body').classList.remove('modal_active');
            scrollTo(0, 0);
            setBommerFlg(false);
            setPoliceFlg(false);
            setStartFlg(true);
        }

        // 勝敗判定
        if (msg.winnerTeam > 0) {
            switch (msg.winnerTeam) {
                case 1:
                    scrollTo(0, 0);
                    setPoliceFlg(true);
                    setEndFlg(true);
                    return;
                case 2:
                    scrollTo(0, 0);
                    setBommerFlg(true);
                    setEndFlg(true);
                    return;
            }
        }
    };

    // データセット
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setData: any = (room) => {
        setTimeBombUserList(room.userList);
        setTurn(room.turn);
        setReleaseNo(room.releaseNo);
        setEndFlg(false);
        setLimitTime(room.limitTime);
        setSecretFlg(room.secretFlg);

        if (room.leadCardsList) {
            setLeadCardsList(room.leadCardsList);
        }
        if (round != room.round && room.winnerTeam === 0) {
            setRound(room.round);
            if (room.round > 1) {
                scrollTo(0, 0);
                setRoundMessageFlg(true);
            }
        }
    };

    // ゲームプレイ
    const play = (cardIndex: number) => {
        const url = '/app/play';
        const data: RoomUserInfo = {
            action: 'play',
            roomId: roomId as string,
            userName: playerName,
            cardIndex: cardIndex,
            winTeam: 0,
        };
        coneect(url, data);
    };

    // アイコン変更
    const changeIcon = useCallback(
        (iconUrl: string) => {
            const url = '/app/changeIcon';
            const usrInfo: RoomUserInfo = {
                action: iconUrl,
                roomId: roomId as string,
                userName: playerName,
                cardIndex: 0,
                winTeam: 0,
            };
            coneect(url, usrInfo);
        },
        [isConnected, playerName]
    );

    const limittimeDone = useCallback(
        (pturn: number) => {
            let turnFlg = false;
            timeBombUserList.forEach((value: TimeBombUser) => {
                if (value.userName === playerName && value.turnFlg) {
                    turnFlg = true;
                }
            });

            if (turnFlg) {
                const url = '/app/timebomb-limittime';
                const info: SocketInfo = {
                    status: 600,
                    roomId: roomId as string,
                    userName: playerName,
                    message: null,
                    obj: pturn,
                };
                try {
                    clientObj.sendMessage(url, JSON.stringify(info));
                } catch (e) {
                    // 処理なし
                }
            }
        },
        [timeBombUserList]
    );

    // 制限時間変更
    const changeLimitTme = (time: number) => {
        const url = '/app/timebomb-setlimittime';
        const info: SocketInfo = {
            status: 900,
            roomId: roomId as string,
            userName: playerName,
            message: null,
            obj: time,
        };

        clientObj.sendMessage(url, JSON.stringify(info));
    };

    // シークレットモード変更
    const changeSecretFlg = () => {
        const url = '/app/timebomb-changesecret';
        const info: SocketInfo = {
            status: 800,
            roomId: roomId as string,
            userName: playerName,
            message: null,
            obj: null,
        };

        clientObj.sendMessage(url, JSON.stringify(info));
    };

    return (
        <Layout home={false}>
            <style jsx global>{`
                body {
                    background-image: url(/images/background.jpg);
                    background-attachment: fixed;
                    background-size: 370px;
                    background-position: bottom left;
                    background-repeat: no-repeat;
                }
            `}</style>
            <Head>
                <meta
                    property="og:image"
                    content={
                        SystemConst.Server.SITE_URL + '/images/background.jpg'
                    }
                />
                <meta property="og:title" content="タイムボムオンライン" />
                <meta
                    property="og:description"
                    content="オンライン上でみんなでタイムボム！"
                />
                <title>タイムボム</title>
            </Head>
            {turn > 0 && (
                <HeaderInfo
                    releaseNo={releaseNo}
                    userSize={timeBombUserList.length}
                    limit={timeBombUserList.length * 4 - turn + 1}
                />
            )}

            {startFlg && <Start />}
            {roundMessageFlg && (
                <Modal type="one">
                    <div
                        className={styles.roundMessage}
                        data-text={`Round${round}`}
                    >
                        {round <= 3 ? `ROUND${round}` : 'FINAL'}
                    </div>
                </Modal>
            )}

            {bommerFlg && (
                <Modal type={'seven'}>
                    <div className={styles.result}>
                        <img src="/images/failed.png" alt="結果" />
                    </div>
                </Modal>
            )}

            {policeFlg && (
                <Modal type={'five'}>
                    <div className={styles.result}>
                        <img src="/images/success.png" alt="結果" />
                    </div>
                </Modal>
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
                topics={['/topic/' + roomId + '/timebomb']}
                ref={(client) => {
                    setClientObj(client);
                }}
                onMessage={(msg) => {
                    // デバッグ用
                    // console.log(msg);
                    receve(msg);
                }}
                onConnect={() => {
                    setIsConnected(true);
                }}
                onDisconnect={disconnect}
            />

            {turn < 1 && (
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
                                const name: string = usernameDom.value;
                                if (name === '') {
                                    return false;
                                }
                                roomIn({
                                    action: 'roomIn',
                                    roomId: roomId as string,
                                    userName: name,
                                    cardIndex: 0,
                                    winTeam: 0,
                                });
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
                            const name: string = usernameDom.value;
                            if (name === '') {
                                return false;
                            }
                            roomIn({
                                action: 'roomIn',
                                roomId: roomId as string,
                                userName: name,
                                cardIndex: 0,
                                winTeam: 0,
                            });
                        }}
                    >
                        Room IN
                    </button>
                </div>
            )}
            {
                // デバッグ用
                false && (
                    <>
                        <input type="text" id="usernametest" />
                        <button
                            onClick={() => {
                                const usernameDom: HTMLInputElement =
                                    document.getElementById(
                                        'usernametest'
                                    ) as HTMLInputElement;

                                roomIn({
                                    action: 'roomIn',
                                    roomId: roomId as string,
                                    userName: usernameDom.value,
                                    cardIndex: 0,
                                    winTeam: 0,
                                });
                            }}
                        >
                            入室
                        </button>
                    </>
                )
            }

            {turn > 0 && (
                <div
                    className={`d-flex justify-content-center ${styles.light}`}
                >
                    {timeBombUserList.map(
                        (value: TimeBombUser, index: number) => {
                            return (
                                <div
                                    key={index}
                                    className={
                                        releaseNo > index ? styles.opend : ''
                                    }
                                >
                                    <img
                                        src="/images/rightoff.png"
                                        alt="light"
                                    />
                                    <img
                                        src="/images/righton.png"
                                        alt="light"
                                    />
                                </div>
                            );
                        }
                    )}
                </div>
            )}

            {limitTime > 0 && turn > 0 && !endFlg && !startFlg && (
                <CountdownClock
                    limitDone={limittimeDone}
                    timeLimit={limitTime}
                    turn={turn}
                />
            )}

            <div className={styles.userInfo}>
                {timeBombUserList.map((value: TimeBombUser, index: number) => {
                    // 手札作成
                    const cardsList: Array<LeadCards> = [];
                    if (leadCardsList) {
                        leadCardsList.forEach(
                            (value: LeadCards, cardIndex: number) => {
                                if (
                                    Math.floor(cardIndex / (6 - round)) ===
                                    index
                                ) {
                                    cardsList.push(leadCardsList[cardIndex]);
                                }
                            }
                        );
                    }
                    return (
                        <UserInfo
                            user={value}
                            cardlist={cardsList}
                            key={index}
                            ownFlg={playerName === value.userName}
                            playfnc={play}
                            round={round}
                            changeIcon={changeIcon}
                            endFlg={endFlg}
                            secretFlg={secretFlg}
                            startFlg={startFlg}
                        ></UserInfo>
                    );
                })}
            </div>
            {playerName !== '' && (turn === 0 || endFlg) && (
                <div className={styles.limittimeinputarea}>
                    <div onClick={() => changeLimitTme(0)}>
                        <input
                            type="radio"
                            id="limit-time-0"
                            name="limit-time"
                            value="0"
                            checked={limitTime === 0}
                            readOnly
                        />
                        <label htmlFor="limit-time-0">
                            <span>NONE</span>
                        </label>
                        <div className={styles.teban}>
                            <img src={'/images/hasami.png'} alt="手番" />
                        </div>
                    </div>
                    <div onClick={() => changeLimitTme(180)}>
                        <input
                            type="radio"
                            id="limit-time-180"
                            name="limit-time"
                            value="180"
                            checked={limitTime === 180}
                            readOnly
                        />
                        <label htmlFor="limit-time-180">
                            <span>3</span>min
                        </label>
                        <div className={styles.teban}>
                            <img src={'/images/hasami.png'} alt="手番" />
                        </div>
                    </div>
                    <div onClick={() => changeLimitTme(300)}>
                        <input
                            type="radio"
                            id="limit-time-300"
                            name="limit-time"
                            value="300"
                            checked={limitTime === 300}
                            readOnly
                        />
                        <label htmlFor="limit-time-300">
                            <span>5</span>min
                        </label>
                        <div className={styles.teban}>
                            <img src={'/images/hasami.png'} alt="手番" />
                        </div>
                    </div>
                    <div onClick={() => changeLimitTme(420)}>
                        <input
                            type="radio"
                            id="limit-time-420"
                            name="limit-time"
                            value="420"
                            checked={limitTime === 420}
                            readOnly
                        />
                        <label htmlFor="limit-time-420">
                            <span>7</span>min
                        </label>
                        <div className={styles.teban}>
                            <img src={'/images/hasami.png'} alt="手番" />
                        </div>
                    </div>
                </div>
            )}

            {playerName !== '' && (turn === 0 || endFlg) && (
                <div className={styles.checkboxarea}>
                    <div className={styles.checkbox}>
                        <input
                            id="seacret"
                            type="checkbox"
                            checked={secretFlg}
                            onChange={changeSecretFlg}
                        />
                        <label htmlFor="seacret">SECRET MODE</label>
                        <div className={styles.tooltiparea}>
                            <span
                                className={styles.tooltip}
                                data-tooltip="自分のカードの場所がわからなくなるモード"
                            >
                                ?
                            </span>
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
                <button
                    onClick={() => {
                        start({
                            action: 'start',
                            roomId: roomId as string,
                            userName: playerName,
                            cardIndex: 0,
                            winTeam: 0,
                        });
                    }}
                >
                    {turn > 0 ? 'GAME RESET' : 'GAME START'}
                </button>
            </div>
            <div className={styles.rulebtn}>
                <button
                    onClick={() =>
                        window.open(
                            'https://www.youtube.com/watch?v=CCMmdl-O52k'
                        )
                    }
                >
                    RULE official
                </button>
            </div>
            <Socialbtn
                url={SystemConst.Server.SITE_URL + '/timebomb/' + roomId}
                title={'タイムボム'}
                via={
                    'タイムボムオンライン！　ゲームデザイナー佐藤雄介様の招待隠匿ゲーム'
                }
            />
        </Layout>
    );
}
