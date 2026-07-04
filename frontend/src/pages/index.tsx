import React from 'react';
import Head from 'next/head';
import { SystemConst } from '../const/next.config';
import styles from '../styles/lp.module.scss';
import Reveal from '../components/lp/Reveal';
import LeafFall from '../components/lp/LeafFall';
import RoomCreateCta from '../components/lp/RoomCreateCta';

const TITLE_SUB = ['セ', 'カ', 'ン', 'ド'];
const TITLE_MAIN: string[][] = [
    ['ワ', 'ン', 'ナ', 'イ', 'ト'],
    ['人', '狼'],
];

const STATS = [
    { label: 'PLAYERS', value: '3〜8', unit: '人', caption: 'プレイ人数' },
    { label: 'TIME', value: '約10', unit: '分', caption: '1プレイの時間' },
    { label: 'SETUP', value: '約1', unit: '分', caption: '準備にかかる時間' },
    { label: 'AGE', value: '10', unit: '歳以上', caption: '対象年齢' },
];

const STEPS = [
    {
        num: '壱',
        color: '#35A8B4',
        title: 'くばる',
        text: '役職カードを1枚ずつ伏せて配り、余りの2枚は場の中央へ。自分の正体は、自分だけがそっと確認します。',
    },
    {
        num: '弐',
        color: '#17454F',
        title: 'ねむる',
        text: '全員が目を閉じる、一度きりの夜。人狼は仲間を確かめ、占い師や怪盗が、闇のなかでひそかに動きます。',
    },
    {
        num: '参',
        color: '#C4646E',
        title: 'はなす',
        text: '朝が来たら議論の時間。名乗り、かまをかけ、嘘を見抜く。記憶と証言が交錯する数分間です。',
    },
    {
        num: '肆',
        color: '#E88F94',
        title: 'ゆびさす',
        text: '「せーの」で一斉に投票。最多票の人物が追放され、勝敗が決まります。──その指は、正しかったのか。',
    },
];

type Camp = 'wolf' | 'village' | 'third';
const CAMP_LABEL: Record<Camp, string> = {
    wolf: '人狼陣営',
    village: '村人陣営',
    third: '第三陣営',
};

const ROLES: {
    glyph: string;
    camp: Camp;
    name: string;
    text: string;
}[] = [
    {
        glyph: '狼',
        camp: 'wolf',
        name: '人狼',
        text: '正体を隠し、夜をやり過ごす闇の住人。仲間と目配せを交わし、村人のふりをして議論を欺きます。',
    },
    {
        glyph: '占',
        camp: 'village',
        name: '占い師',
        text: '夜、誰かひとりの正体か、中央の2枚をのぞき見る。真実にもっとも近く、もっとも疑われる者。',
    },
    {
        glyph: '盗',
        camp: 'village',
        name: '怪盗',
        text: '夜、誰かと役職をすり替えられる。朝を迎えたとき、あなたは本当に「あなた」のままですか。',
    },
    {
        glyph: '村',
        camp: 'village',
        name: '村人',
        text: '能力は持たない。あるのは言葉と観察眼だけ。それでも議論の中心に立つのは、いつも村人です。',
    },
    {
        glyph: '狂',
        camp: 'wolf',
        name: '狂人',
        text: '人狼の勝利を望む人間。占い師を騙り、場をかき乱す。嘘をつくほど輝く、愉快な裏切り者。',
    },
    {
        glyph: '吊',
        camp: 'third',
        name: '吊人',
        text: '追放されたとき、ただひとり勝利する。疑われるために振る舞う、すべてを裏返す逆転の役職。',
    },
];

const CAMP_CLASS: Record<Camp, string> = {
    wolf: styles.roleWolf,
    village: styles.roleVillage,
    third: styles.roleThird,
};

export default function Homepage() {
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
                    content="ブラウザで遊べる正体隠匿ゲーム「セカンドワンナイト人狼」。役職が選べて1プレイ約10分。GM不要・脱落なしで、はじめての人ともすぐ遊べます。"
                />
                <meta
                    name="keywords"
                    content="人狼ゲーム,ブラウザゲーム,セカンドワンナイト人狼,オンライン,ボードゲーム,ワンナイト人狼"
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
                    content={SystemConst.Server.SITE_URL + '/images/hero.jpg'}
                />
                <meta
                    property="og:description"
                    content="ブラウザで遊べる正体隠匿ゲーム「セカンドワンナイト人狼」。役職が選べて1プレイ約10分。"
                />
                <title>セカンドワンナイト人狼</title>
            </Head>
            <style jsx global>
                {`
                    html,
                    body {
                        background-color: #effdfe;
                        scroll-behavior: smooth;
                    }
                `}
            </style>

            <main className={styles.lp}>
                {/* ヒーロー */}
                <section id="hero" className={styles.hero}>
                    <LeafFall />
                    <div className={styles.heroInner}>
                        <div className={styles.heroCopy}>
                            <p className={styles.heroEyebrow}>
                                SECOND ONE NIGHT WEREWOLF ─ 正体隠匿ボードゲーム
                            </p>
                            <h1 className={styles.heroTitle}>
                                <span className={styles.titleSub}>
                                    {TITLE_SUB.map((ch, i) => (
                                        <span
                                            key={i}
                                            className={styles.charTeal}
                                            style={{
                                                animationDelay: `${0.15 + i * 0.09}s`,
                                            }}
                                        >
                                            {ch}
                                        </span>
                                    ))}
                                </span>
                                <span className={styles.titleMain}>
                                    {TITLE_MAIN.map((word, wi) => (
                                        <span
                                            key={wi}
                                            className={styles.titleWord}
                                        >
                                            {word.map((ch, i) => (
                                                <span
                                                    key={i}
                                                    className={styles.charInk}
                                                    style={{
                                                        animationDelay: `${
                                                            wi === 0
                                                                ? 0.62 + i * 0.1
                                                                : 1.16 +
                                                                  i * 0.14
                                                        }s`,
                                                    }}
                                                >
                                                    {ch}
                                                </span>
                                            ))}
                                        </span>
                                    ))}
                                </span>
                            </h1>
                            <p className={styles.tagline}>
                                ── 夜は、二度おとずれる。
                            </p>
                            <p className={styles.lead}>
                                たった一晩の、嘘と推理。配られた正体はあなただけの秘密。時計の針がひとめぐりする前に、この村に潜む人狼を見つけ出せるか──。
                            </p>
                            <div className={styles.chips}>
                                <span className={styles.chip}>3〜8人</span>
                                <span className={styles.chip}>
                                    1プレイ 約10分
                                </span>
                                <span className={styles.chip}>10歳以上</span>
                            </div>
                            <div className={styles.heroCta}>
                                <RoomCreateCta />
                            </div>
                        </div>
                        <div className={styles.heroArt}>
                            <div
                                aria-hidden="true"
                                className={styles.heroGlow}
                            ></div>
                            <div
                                aria-hidden="true"
                                className={styles.heroRing1}
                            ></div>
                            <div
                                aria-hidden="true"
                                className={styles.heroRing2}
                            ></div>
                            <div aria-hidden="true" className={styles.heroHand}>
                                <div></div>
                            </div>
                            <div className={styles.heroImgWrap}>
                                <picture>
                                    <source
                                        srcSet="/images/hero.webp"
                                        type="image/webp"
                                    />
                                    <img
                                        src="/images/hero.jpg"
                                        alt="昼と夜に分かたれた時計の円環の中、紅葉の舞う空をみつめる少女のイラスト"
                                        className={styles.heroImg}
                                    />
                                </picture>
                            </div>
                        </div>
                    </div>
                    <div aria-hidden="true" className={styles.scrollCue}>
                        <span>SCROLL</span>
                        <span className={styles.cueLine}>
                            <span></span>
                        </span>
                    </div>
                </section>

                {/* ABOUT */}
                <section id="about" className={styles.about}>
                    <div className={styles.aboutInner}>
                        <Reveal className={styles.sectionHead}>
                            <p
                                className={`${styles.eyebrow} ${styles.aboutEyebrow}`}
                            >
                                ABOUT
                            </p>
                            <h2 className={styles.sectionTitle}>
                                一夜のあいだに、すべてが決まる。
                            </h2>
                            <div className={styles.divider}></div>
                        </Reveal>
                        <Reveal delay="0.1s">
                            <p className={styles.aboutLead}>
                                配られた役職カードは、自分だけがそっと確認。全員が目を閉じる「夜」を越えたら、短い議論と一度きりの投票で人狼をあばき出す──。ゲームマスター不要・脱落者なし、はじめての人ともすぐに遊べるワンナイト人狼です。
                            </p>
                        </Reveal>
                        <div className={styles.statGrid}>
                            {STATS.map((stat, i) => (
                                <Reveal
                                    key={stat.label}
                                    delay={`${0.05 + i * 0.07}s`}
                                >
                                    <div className={styles.statCard}>
                                        <p className={styles.statLabel}>
                                            {stat.label}
                                        </p>
                                        <p className={styles.statValue}>
                                            {stat.value}
                                            <span>{stat.unit}</span>
                                        </p>
                                        <p className={styles.statCaption}>
                                            {stat.caption}
                                        </p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* HOW TO PLAY */}
                <section id="howto" className={styles.howto}>
                    <div className={styles.howtoInner}>
                        <Reveal className={styles.sectionHead}>
                            <p
                                className={`${styles.eyebrow} ${styles.howtoEyebrow}`}
                            >
                                HOW TO PLAY
                            </p>
                            <h2 className={styles.sectionTitle}>
                                遊び方は、たったの四手順。
                            </h2>
                            <div className={styles.divider}></div>
                        </Reveal>
                        <div className={styles.stepGrid}>
                            {STEPS.map((step, i) => (
                                <Reveal
                                    key={step.num}
                                    delay={`${0.05 + i * 0.08}s`}
                                >
                                    <div className={styles.stepCard}>
                                        <p
                                            className={styles.stepNum}
                                            style={{ color: step.color }}
                                        >
                                            {step.num}
                                        </p>
                                        <h3>{step.title}</h3>
                                        <p>{step.text}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ROLES */}
                <section id="roles" className={styles.roles}>
                    <div
                        aria-hidden="true"
                        className={styles.rolesGlowTop}
                    ></div>
                    <div
                        aria-hidden="true"
                        className={styles.rolesGlowBottom}
                    ></div>
                    <div className={styles.rolesInner}>
                        <Reveal className={styles.sectionHead}>
                            <p
                                className={`${styles.eyebrow} ${styles.rolesEyebrow}`}
                            >
                                ROLES
                            </p>
                            <h2
                                className={`${styles.sectionTitle} ${styles.rolesTitle}`}
                            >
                                あなたは今夜、誰になる。
                            </h2>
                            <div
                                className={`${styles.divider} ${styles.rolesDivider}`}
                            ></div>
                        </Reveal>
                        <div className={styles.roleGrid}>
                            {ROLES.map((role, i) => (
                                <Reveal
                                    key={role.name}
                                    delay={`${0.05 + i * 0.06}s`}
                                >
                                    <div
                                        className={`${styles.roleCard} ${CAMP_CLASS[role.camp]}`}
                                    >
                                        <div className={styles.roleHead}>
                                            <span className={styles.roleGlyph}>
                                                {role.glyph}
                                            </span>
                                            <span className={styles.roleCamp}>
                                                {CAMP_LABEL[role.camp]}
                                            </span>
                                        </div>
                                        <h3>{role.name}</h3>
                                        <p>{role.text}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section id="cta" className={styles.cta}>
                    <div aria-hidden="true" className={styles.ctaRing1}></div>
                    <div aria-hidden="true" className={styles.ctaRing2}></div>
                    <div className={styles.ctaInner}>
                        <Reveal>
                            <p
                                className={`${styles.eyebrow} ${styles.ctaEyebrow}`}
                            >
                                PLAY NOW
                            </p>
                        </Reveal>
                        <Reveal delay="0.08s">
                            <h2 className={styles.ctaTitle}>
                                さあ、二度目の夜へ。
                            </h2>
                        </Reveal>
                        <Reveal delay="0.16s">
                            <p className={styles.ctaLead}>
                                紅葉の散る夜、時計の針がもうひとめぐり。
                                <br />
                                あなたの村に、人狼は潜んでいるか。
                            </p>
                        </Reveal>
                        <Reveal delay="0.24s">
                            <RoomCreateCta invert />
                        </Reveal>
                    </div>
                </section>

                {/* フッター */}
                <footer className={styles.footer}>
                    <div className={styles.footerInner}>
                        <p className={styles.footerLogo}>
                            セカンドワンナイト人狼
                        </p>
                        <nav>
                            <a href="#about">ゲーム概要</a>
                            <a href="#howto">遊び方</a>
                            <a href="#roles">役職紹介</a>
                            <a href="#cta">あそぶ</a>
                        </nav>
                        <p className={styles.copyright}>
                            © 2026 SECOND ONE NIGHT WEREWOLF
                        </p>
                    </div>
                </footer>
            </main>
        </>
    );
}
