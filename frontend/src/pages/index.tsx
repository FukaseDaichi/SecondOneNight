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
    { label: 'PLAYERS', value: '4', unit: '人〜', caption: 'プレイ人数' },
    { label: 'TIME', value: '約10', unit: '分', caption: '1プレイの時間' },
    { label: 'SETUP', value: '約1', unit: '分', caption: '準備にかかる時間' },
    { label: 'AGE', value: '10', unit: '歳以上', caption: '対象年齢' },
];

const STEPS = [
    {
        num: '壱',
        color: '#35A8B4',
        title: 'えらぶ',
        text: 'スタートプレイヤーには2枚、ほかのプレイヤーには1枚の役職が配られます。2枚から好きなほうを選び、残りを次の人へ。最後まで選ばれなかった役職は、NPCのものになります。',
    },
    {
        num: '弐',
        color: '#17454F',
        title: 'かたる',
        text: '決めた時間だけ話し合う。「最初に配られた役職」「渡された役職」「選んだ役職」は、語ってもいい大切な手がかり。占い・暗殺・独裁など、一部の役職は議論中に能力を使えます。',
    },
    {
        num: '参',
        color: '#C4646E',
        title: 'さす',
        text: '「せーの」で一斉に投票。最多票のプレイヤーが処刑され、それぞれの勝利条件で勝敗が決まります。全員に1票ずつなら、全員が処刑に。',
    },
];

type Camp = 'wolf' | 'village' | 'third';
const CAMP_LABEL: Record<Camp, string> = {
    wolf: '人狼陣営',
    village: '村人陣営',
    third: '第三陣営',
};

const ROLES: {
    rollNo: number;
    camp: Camp;
    name: string;
    text: string;
}[] = [
    {
        rollNo: 1,
        camp: 'wolf',
        name: '人狼',
        text: '村に紛れこんだ狼。味方の人狼が誰かを知っている。人狼が誰も処刑されなければ、その勝ち。',
    },
    {
        rollNo: 8,
        camp: 'village',
        name: '占い師',
        text: '議論中、指名した1人の正体を占える。ただし占えば、あなたは投票の権利を失う。',
    },
    {
        rollNo: 11,
        camp: 'wolf',
        name: '怪盗',
        text: '議論中、NPCとこっそり役職を交換できる。交換したあとの役職が、そのまま勝利条件に。使わない選択も。',
    },
    {
        rollNo: 6,
        camp: 'village',
        name: '独裁者',
        text: '議論中に役職を開示し、指名した1人をただちに処刑できる、村の切り札。',
    },
    {
        rollNo: 10,
        camp: 'wolf',
        name: '暗殺者',
        text: '議論のさなか、狙った1人を殺害できる。殺された者は、議論にも投票にも加われない。',
    },
    {
        rollNo: 3,
        camp: 'village',
        name: '村長',
        text: '村の重鎮。あなたの投票は、2票分として数えられる。',
    },
    {
        rollNo: 5,
        camp: 'wolf',
        name: '狂人',
        text: '人間でありながら、人狼の勝利を願う裏切り者。人狼が処刑されなければ、あなたの勝ち。',
    },
    {
        rollNo: 4,
        camp: 'third',
        name: 'てるてる',
        text: '第三陣営。自分が処刑されたときだけ、たったひとり勝利する。',
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
                    content={SystemConst.Server.SITE_URL + '/images/ogp.jpg'}
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
                                SECOND ONE NIGHT WEREWOLF ─
                                役職が選べる正体隠匿ゲーム
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
                                たった数分の、嘘と推理。配られた札から、なりたい役職を自分で選べる。ひとめぐりの議論と投票で、この村に潜む人狼を見つけ出せるか──。
                            </p>
                            <div className={styles.chips}>
                                <span className={styles.chip}>4人〜</span>
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
                                配られた役職を、そのまま引き受けなくていい。2枚から好きな役職を選び、残りを隣へ渡していく──それがこのゲーム。役職選択で得た手がかりをもとに議論し、一度きりの投票で人狼をあばきます。ゲームマスター不要・脱落者なし。必ず加わるNPCが最後に余った役職を引き受けるので、はじめての人ともすぐに遊べます。
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
                                遊び方は、たったの三手順。
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
                                        <img
                                            className={styles.roleImg}
                                            src={`/images/werewolf/roll/${role.rollNo}.jpg`}
                                            alt={`${role.name}の役職カード`}
                                            loading="lazy"
                                        />
                                        <div className={styles.roleHead}>
                                            <h3>{role.name}</h3>
                                            <span className={styles.roleCamp}>
                                                {CAMP_LABEL[role.camp]}
                                            </span>
                                        </div>
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
