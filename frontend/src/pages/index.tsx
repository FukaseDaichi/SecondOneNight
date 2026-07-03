import React from 'react';
import Head from 'next/head';
import { SystemConst } from '../const/next.config';
import { useEffect } from 'react';
import styles from '../styles/homepage.module.scss';
import CreateGameBtn from '../components/home/creategamebtn';
import Socialbtn from '../components/button/sosialbtn';
import Background from '../components/home/background';

// パララックス
const scrollEvent = () => {
    const margin = window.scrollY / 2;
    const mainImgDom = document.getElementById('main-img');
    mainImgDom.style.marginTop = margin + 'px';
};

export default function Homepage(): JSX.Element {
    // 初回実行
    useEffect(() => {
        window.addEventListener('scroll', scrollEvent);
        return () => window.removeEventListener('scroll', scrollEvent);
    }, []);
    return (
        <>
            <Head>
                <meta
                    name="google-site-verification"
                    content="PL4mFXSOkoRJNiMOigMC2VmfdZ3X3nOMzuvZmMPmbmc"
                />
                <meta name="title" content="セカンドワンナイト人狼" />
                <meta
                    name="description"
                    content="ブラウザで遊べる人狼ゲーム「セカンドワンナイト人狼」を公開しています。「タイムボム」「ハイドアウト」「エセ芸術家ニューヨークへ行く」などのボードゲームがブラウザで遊べます。"
                />
                <meta
                    name="keywords"
                    content="人狼ゲーム,ブラウザゲーム,セカンドワンナイト人狼,オンライン,ボードゲーム,ブラウザ,アプリ,タイムボム,ハイドアウト,エセ芸術家,ニューヨークへ行く"
                />
                <meta property="og:url" content={SystemConst.Server.SITE_URL} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="セカンドワンナイト人狼" />
                <meta
                    property="og:site_name"
                    content="セカンドワンナイト人狼"
                />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@2d7rqU5gFQ6VpGo" />
                <meta
                    property="og:image"
                    content={
                        SystemConst.Server.SITE_URL +
                        '/images/werewolf/werewolfbackground.png'
                    }
                />
                <meta
                    property="og:description"
                    content="ブラウザ上で正体隠匿ゲームが遊べます。役職が選べて１日で終わる人狼ゲーム「セカンドワンナイト人狼」を公開しています。「タイムボム」「ハイドアウト」などのボードゲームがブラウザで遊べます。"
                />
                <title>セカンドワンナイト人狼</title>
            </Head>
            <style jsx global>
                {`
                    html,
                    body {
                        background-color: #f9fbee;
                    }
                `}
            </style>

            <main className={styles.home}>
                <section className={styles.mainsection}>
                    <div className={styles['main-content']}>
                        <h3>site</h3>
                        <h1>
                            セカンド
                            <br />
                            ワンナイト人狼
                        </h1>
                        <h2>
                            <a href="https://twitter.com/nocopyrightgirl">
                                ノーコピーライトガール
                            </a>
                            様の素晴らしい画像を拝借し、オリジナルのブラウザゲーム「セカンドワンナイト人狼」を公開しています。
                        </h2>
                    </div>
                    <div className={styles['main-img']}>
                        <div>
                            <img
                                src="/images/main.jpg"
                                alt="メイン画像"
                                id="main-img"
                            />
                        </div>
                    </div>
                </section>
                <section className={styles.game}>
                    <div className={styles['sub-title']}>
                        <h3>games</h3>
                        <h2>ゲーム一覧</h2>
                    </div>
                    <div className={styles.gamelist}>
                        <CreateGameBtn
                            title="セカンドワンナイト人狼"
                            discription="セカンドワンナイト人狼！　役職を選べて1日で終わる人狼ゲーム！ 初心者にもおすすめ！"
                            imgUrl="/images/werewolf/werewolfbackground.png"
                            gameId="werewolf"
                        />
                        <CreateGameBtn
                            title="タイムボム"
                            discription="ゲームデザイナー佐藤雄介様の手がけたあの名作「タイムボム」！（非公式）"
                            imgUrl="/images/background.jpg"
                            gameId="timebomb"
                        />
                        <CreateGameBtn
                            title="ハイドアウト"
                            discription="あの名作タイムボムの次回作！（非公式）"
                            imgUrl="/images/hideout/hideoutbackground.png"
                            gameId="hideout"
                        />
                        <CreateGameBtn
                            title="エセ芸術家ニューヨークへ行く"
                            discription="お絵描き人狼（非公式）"
                            imgUrl="/images/fakeartist/fakeartistbackground.png"
                            gameId="fakeartist"
                        />
                        {/* <CreateGameBtn
                            title="ディクリプト（開発中）"
                            discription="暗号解読ゲーム！（非公式）"
                            imgUrl="/images/decrypt/decryptbackground.png"
                            gameId="decrypt"
                        /> */}
                    </div>
                </section>
                <div className={styles.beforeobj}>
                    <Socialbtn
                        url={SystemConst.Server.SITE_URL}
                        title={'セカンドワンナイト人狼'}
                        via={'ブラウザ上で正体隠匿ゲームが遊べます。'}
                    />
                </div>
            </main>
            <Background />
        </>
    );
}
