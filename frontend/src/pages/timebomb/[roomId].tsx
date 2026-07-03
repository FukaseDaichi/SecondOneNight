import React from 'react';
import { useRouter } from 'next/router';
import { SystemConst } from '../../const/next.config';
import Layout from '../../components/layout';
import Start from '../../components/common/Start';
import { TimeBombUser, LeadCards } from '../../type';
import UserInfo from '../../components/timebomb/userInfo';
import Modal from '../../components/modal';
import Chatmessage from '../../components/message/chatmessage';
import styles from '../../styles/components/timebomb/room.module.scss';
import HeaderInfo from '../../components/timebomb/headInfo';
import CountdownClock from '../../components/countdownclock';
import Router from 'next/router';
import Head from 'next/head';
import Socialbtn from '../../components/button/sosialbtn';
import ConnectionStatus from '../../components/common/ConnectionStatus';
import { useTimebombRoom } from '../../features/timebomb/useTimebombRoom';

export default function Room() {
    // roomId取得
    const router = useRouter();
    const { roomId } = router.query;

    const {
        state,
        connected,
        status,
        entered,
        roomIn,
        start,
        play,
        changeIcon,
        limittimeDone,
        changeLimitTme,
        changeSecretFlg,
    } = useTimebombRoom(roomId as string | undefined);

    const {
        playerName,
        timeBombUserList,
        leadCardsList,
        startFlg,
        messageList,
        round,
        roundMessageFlg,
        turn,
        releaseNo,
        limitTime,
        secretFlg,
        endFlg,
        bommerFlg,
        policeFlg,
    } = state;

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

            <ConnectionStatus status={status} />

            {turn < 1 && (
                <div
                    className={`${styles.roominbtn} ${
                        entered ? styles.in : ''
                    }`}
                >
                    <p>
                        <label htmlFor="username">Name</label>
                    </p>
                    <input
                        disabled={!connected}
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
                        disabled={!connected}
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
