import React from 'react';
import styles from '../../../styles/components/werewolf/rule.module.scss';

type RuleProps = {
    endFnc: () => void;
};

const SECTIONS = [
    {
        num: '壱',
        title: 'そなえる ─ 準備',
        text: 'このゲームには参加者に加えて「NPC」が1人分参加します。ゲーム開始前に、参加者+1個の役職を設定してください。「おすすめセット」を使うと人数に合った役職配分をすぐに設定できます。議論時間(3分など)もあらかじめ決めておきましょう。',
        note: '役職の数が参加者+1より多い場合、誰にも配られない役職(役欠け)が発生します。すべての人狼が役欠けになることはありません。',
    },
    {
        num: '弐',
        title: 'えらぶ ─ 役職選択',
        text: '順番は自動で決まります。スタートプレイヤーには2つ、他のプレイヤーには1つの役職が届きます。2つの中から好きな役職を選び、残った方を次のプレイヤーへ。最後に残った役職がNPCのものになります。「初めに届いた役職」「渡された役職」「選んだ役職」──この情報が議論の武器です。忘れないように。',
        note: null,
    },
    {
        num: '参',
        title: 'はなす ─ 議論',
        text: '決めた時間内で議論します。名乗り、かまをかけ、嘘を見抜いてください。一部の役職は議論中に特殊能力を使えます。時間が来たら終了ボタンで議論を締めます。',
        note: null,
    },
    {
        num: '肆',
        title: 'ゆびさす ─ 投票',
        text: '議論で得た情報をもとに一斉投票。最多票のプレイヤーが処刑されます。全員に1票ずつ入った場合は、全員が処刑されます。役職ごとの勝利条件にもとづいて勝敗が決まります。',
        note: null,
    },
];

export default function Rule(props: RuleProps) {
    return (
        <div className={styles.overlay} onClick={props.endFnc}>
            <div
                className={styles.modal}
                role="dialog"
                aria-label="遊び方"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.head}>
                    <div>
                        <p>HOW TO PLAY</p>
                        <h1>遊び方</h1>
                    </div>
                    <button
                        className={styles.close}
                        aria-label="閉じる"
                        onClick={props.endFnc}
                    >
                        ✕
                    </button>
                </div>
                <div className={styles.body}>
                    <div className={styles.section}>
                        <p>
                            自分で役職を選べるワンナイト人狼です。「役職選択」「議論」「投票」の3つの流れで進みます。役職選択で得た情報をもとに話せるので、人狼ゲームで何を話せばいいかわからない人にこそおすすめです。
                        </p>
                    </div>
                    {SECTIONS.map((s) => (
                        <div className={styles.section} key={s.num}>
                            <h2>
                                <span className={styles.num}>{s.num}</span>
                                {s.title}
                            </h2>
                            <p>{s.text}</p>
                            {s.note && <p className={styles.note}>{s.note}</p>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
