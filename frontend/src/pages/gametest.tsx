import React from 'react';
import Layout from '../components/layout';
import House from '../components/house';
import PulsingButton from '../components/button/pulsingbutton';
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

export default function CreateRoomWerewolf(): JSX.Element {
    const [createFlg, setCreateFlg] = useState(false);
    const [roomId, setRoomId] = useState('');

    // ルーム作成
    const createRoombtn = async () => {
        if (createFlg) {
            return;
        }
        const url: string = SystemConst.Server.AP_HOST + 'createroom/werewolf';
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
                roomUrlDom.innerText = 'テスト中';
                setCreateFlg(true);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    // ルーム入室
    const roomIn = () => {
        Router.push('/werewolf/' + roomId);
    };

    return (
        <Layout home={true}>
            <Head>
                <meta
                    property="og:image"
                    content={SystemConst.Server.SITE_URL + '/images/ogp.jpg'}
                />
                <meta property="og:title" content="ボードゲームの部屋" />
                <meta
                    property="og:description"
                    content="オンライン上でボードゲームができます"
                />
                <title>ボードゲームの部屋</title>
            </Head>
            <House />
            <div className={`${styles.home} ${!createFlg && styles.non}`}>
                <div id="room-url" className="h2"></div>
                <section>
                    <button
                        type="button"
                        className={`${styles.lined} ${styles.thick}}`}
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
            <div className="">
                <PulsingButton
                    value="CREATE!"
                    onClickFnc={createRoombtn}
                    viewFlg={createFlg}
                />
            </div>
        </Layout>
    );
}
