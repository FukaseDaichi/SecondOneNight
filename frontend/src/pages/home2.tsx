import React from 'react';

import Layout from '../components/layout';
import House from '../components/house';
import ImagePulsingBtn from '../components/button/imagepulsingbtn';
import { useState } from 'react';
import { SystemConst } from '../const/next.config';
import styles from '../styles/home.module.scss';
import Router from 'next/router';
import Head from 'next/head';

const copyText = () => {
    const roomUrlDom = document.querySelector('#room-url');
    document.getSelection().selectAllChildren(roomUrlDom);
    // 選択範囲のコピー
    document.execCommand('copy');
    // テキスト選択の解除
    document.getSelection().empty();

    const btnDom = document.getElementById('copy-btn');
    btnDom.classList.add(styles.copyed);
    btnDom.innerText = 'COPYED!';
};

export default function CreateRoom(): JSX.Element {
    const [createFlg, setCreateFlg] = useState(false);
    const [gameName, setGameName] = useState('');
    const [roomId, setRoomId] = useState('');

    // ルーム作成
    const createRoombtn = async (game: string) => {
        setGameName(game);

        if (createFlg) {
            return;
        }

        let url = SystemConst.Server.AP_HOST + SystemConst.Server.CREATE_ROOM;
        if (game !== 'timebomb') {
            url = url + '/' + game;
        }

        await fetch(url)
            .then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    throw new Error();
                }
            })
            .then((resJson) => {
                setRoomId(resJson.roomId);
                const roomUrlDom = document.querySelector(
                    '#room-url'
                ) as HTMLElement;
                roomUrlDom.innerText =
                    location.href + game + '/' + resJson.roomId;
                setCreateFlg(true);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    // ルーム入室
    const roomIn = () => {
        Router.push('/' + gameName + '/' + roomId);
    };

    return (
        <Layout>
            <Head>
                <meta
                    property="og:image"
                    content={SystemConst.Server.SITE_URL + '/images/ogp.jpg'}
                />
                <meta property="og:title" content="セカンドワンナイト人狼" />
                <meta
                    property="og:description"
                    content="ブラウザ上で正体隠匿ゲームが遊べるページです。役職が選べる１日で終わる人狼ゲーム。「タイムボム」「ハイドアウト」などのボードゲームがブラウザで遊べます。"
                />
                <title>セカンドワンナイト人狼</title>
            </Head>
            <House />
            <div className={`${styles.home} ${!createFlg && styles.non}`}>
                <div id="room-url"></div>
                <section>
                    <button
                        type="button"
                        className={`${styles.lined} ${styles.thick}`}
                        onClick={copyText}
                        id="copy-btn"
                    >
                        URL COPY
                    </button>
                    <button
                        type="button"
                        className={`${styles.lined} ${styles.thick}`}
                        onClick={roomIn}
                    >
                        ROOMIN!
                    </button>
                </section>
            </div>
            <div
                className={`${styles.spinner} ${
                    gameName === '' || createFlg ? 'invisible' : 'visible'
                }`}
            >
                <div className="m-auto">
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            </div>
            <div className={styles.createbtnarea}>
                <ImagePulsingBtn
                    value="OneNight"
                    onClickFnc={() => createRoombtn('werewolf')}
                    viewFlg={gameName !== ''}
                    imageUrl={'/images/werewolf/werewolfbackground.png'}
                    imageWidth={80}
                />
                <ImagePulsingBtn
                    value="TimeBomb!"
                    onClickFnc={() => createRoombtn('timebomb')}
                    viewFlg={gameName !== ''}
                    imageUrl={'/images/background.jpg'}
                    imageWidth={80}
                />
                <ImagePulsingBtn
                    value="Hideout!"
                    onClickFnc={() => createRoombtn('hideout')}
                    viewFlg={gameName !== ''}
                    imageUrl={'/images/hideout/hideoutbackground.png'}
                    imageWidth={80}
                />
            </div>
        </Layout>
    );
}
