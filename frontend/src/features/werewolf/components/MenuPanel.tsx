import React from 'react';
import styles from '../../../styles/components/werewolf/menupanel.module.scss';
import WerewolfSet from './werewolfset';
import RollCustomize from './RollCustomize';
import LimitTimeSelector from './LimitTimeSelector';
import { lobbyReadiness } from '../lobby';
import { WerewolfRoll } from '../../../type/werewolf';

type MenuPanelProps = {
    userCount: number;
    counterMap: { [rollNo: number]: number };
    staticRollList: Array<WerewolfRoll>;
    counter: (rollNo: number, delta: 1 | -1) => void;
    setRoll: () => void;
    setRollSet: (rollNoList: Array<number>) => void;
    setModalRoll: (roll: WerewolfRoll | null) => void;
    setModalOwnFlg: (value: boolean) => void;
    limitTime: number;
    changeLimitTime: (time: number) => void;
};

// お品書きパネル: プリセット / 役職構成 / 議論時間を1枚に統合し、開始条件の過不足を表示する
export default function MenuPanel(props: MenuPanelProps) {
    const readiness = lobbyReadiness(
        props.userCount,
        props.counterMap,
        props.staticRollList
    );
    const total = Object.values(props.counterMap).reduce((a, b) => a + b, 0);
    // 開始条件は「役職合計 > 参加人数」(lobbyReadiness と同じ判定)
    const required = props.userCount + 1;

    return (
        <>
            <section className={styles.panel} aria-label="ゲーム設定">
                <p className={styles.eyebrow}>GAME SETTINGS</p>
                <h2 className={styles.title}>お品書き</h2>
                <div className={styles.section}>
                    <p className={styles.label}>一、役職の取り合わせ</p>
                    <div className={styles.rollHead}>
                        <WerewolfSet
                            userSize={props.userCount}
                            changeFnc={props.setRollSet}
                        />
                        <button
                            className={styles.apply}
                            onClick={props.setRoll}
                        >
                            設定
                        </button>
                        <p className={styles.tally}>
                            合計 <strong>{total}</strong> / 必要 {required} 枚
                        </p>
                    </div>
                    <RollCustomize
                        staticRollList={props.staticRollList}
                        counterMap={props.counterMap}
                        counter={props.counter}
                        setModalRoll={props.setModalRoll}
                        setModalOwnFlg={props.setModalOwnFlg}
                    />
                </div>
                <div className={styles.section}>
                    <p className={styles.label}>二、議論のお時間</p>
                    <LimitTimeSelector
                        limitTime={props.limitTime}
                        changeLimitTime={props.changeLimitTime}
                    />
                </div>
            </section>
            {!readiness.ready && (
                <ul className={styles.notice} role="status">
                    {readiness.messages.map((m) => (
                        <li key={m}>{m}</li>
                    ))}
                </ul>
            )}
        </>
    );
}
