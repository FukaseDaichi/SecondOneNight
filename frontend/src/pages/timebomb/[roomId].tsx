import React from 'react';
import { useRouter } from 'next/router';
import { SystemConst } from '../../const/next.config';
import Layout from '../../components/layout';
import Start from '../../components/common/Start';
import Chatmessage from '../../components/message/chatmessage';
import styles from '../../styles/components/timebomb/room.module.scss';
import HeaderInfo from '../../features/timebomb/components/headInfo';
import CountdownClock from '../../components/countdownclock';
import Head from 'next/head';
import Socialbtn from '../../components/button/sosialbtn';
import ConnectionStatus from '../../components/common/ConnectionStatus';
import RoomInForm from '../../components/common/RoomInForm';
import ResultModals from '../../features/timebomb/components/ResultModals';
import ReleaseLights from '../../features/timebomb/components/ReleaseLights';
import LimitTimeSelector from '../../features/timebomb/components/LimitTimeSelector';
import SecretModeCheckbox from '../../features/timebomb/components/SecretModeCheckbox';
import PlayerField from '../../features/timebomb/components/PlayerField';
import GameButtons from '../../features/timebomb/components/GameButtons';
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
            <ResultModals
                roundMessageFlg={roundMessageFlg}
                round={round}
                bommerFlg={bommerFlg}
                policeFlg={policeFlg}
            />

            {messageList.map((value, index) => {
                if (index === messageList.length - 1) {
                    return (
                        <Chatmessage value={value} type="info" key={index} />
                    );
                }
            })}

            <ConnectionStatus status={status} />

            {turn < 1 && (
                <RoomInForm
                    connected={connected}
                    entered={entered}
                    onRoomIn={(name) => {
                        if (name === '') {
                            return;
                        }
                        roomIn({
                            action: 'roomIn',
                            roomId: roomId as string,
                            userName: name,
                            cardIndex: 0,
                            winTeam: 0,
                        });
                    }}
                    className={styles.roominbtn}
                    enteredClassName={styles.in}
                />
            )}

            {turn > 0 && (
                <ReleaseLights
                    timeBombUserList={timeBombUserList}
                    releaseNo={releaseNo}
                />
            )}

            {limitTime > 0 && turn > 0 && !endFlg && !startFlg && (
                <CountdownClock
                    limitDone={limittimeDone}
                    timeLimit={limitTime}
                    turn={turn}
                />
            )}

            <PlayerField
                timeBombUserList={timeBombUserList}
                leadCardsList={leadCardsList}
                round={round}
                playerName={playerName}
                play={play}
                changeIcon={changeIcon}
                endFlg={endFlg}
                secretFlg={secretFlg}
                startFlg={startFlg}
            />
            {playerName !== '' && (turn === 0 || endFlg) && (
                <LimitTimeSelector
                    limitTime={limitTime}
                    onChange={changeLimitTme}
                />
            )}

            {playerName !== '' && (turn === 0 || endFlg) && (
                <SecretModeCheckbox
                    secretFlg={secretFlg}
                    onChange={changeSecretFlg}
                />
            )}
            <GameButtons
                turn={turn}
                playerName={playerName}
                roomId={roomId as string}
                start={start}
            />
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
