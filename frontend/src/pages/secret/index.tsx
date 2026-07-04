import React from 'react';
import Head from 'next/head';
import CreateGameBtn from '../../components/home/creategamebtn';
import styles from '../../styles/secret.module.scss';

export default function SecretPage() {
    return (
        <>
            <Head>
                <title>hidden games</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <main className={styles.secret}>
                <h1>HIDDEN GAMES</h1>
                <p>
                    ここは非公開のあそび場です。このページのURLは、そっと胸にしまっておいてください。
                </p>
                <div className={styles.list}>
                    <CreateGameBtn
                        title="タイムボム"
                        discription="ゲームデザイナー佐藤雄介様の手がけたあの名作「タイムボム」!(非公式)"
                        imgUrl="/images/background.jpg"
                        gameId="timebomb"
                    />
                    <CreateGameBtn
                        title="ハイドアウト"
                        discription="あの名作タイムボムの次回作!(非公式)"
                        imgUrl="/images/hideout/hideoutbackground.png"
                        gameId="hideout"
                    />
                    <CreateGameBtn
                        title="エセ芸術家ニューヨークへ行く"
                        discription="お絵描き人狼(非公式)"
                        imgUrl="/images/fakeartist/fakeartistbackground.png"
                        gameId="fakeartist"
                    />
                </div>
            </main>
        </>
    );
}
