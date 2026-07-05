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
    turn: number;
};

// お品書きパネル: プリセット / 役職構成 / 議論時間を1枚に統合し、開始条件の過不足を表示する
export default function MenuPanel(props: MenuPanelProps) {
    const readiness = lobbyReadiness(
        props.userCount,
        props.counterMap,
        props.staticRollList
    );
    return (
        <section className={styles.panel} aria-label="ゲーム設定">
            <h2 className={styles.title}>お品書き</h2>
            <div className={styles.section}>
                <p className={styles.label}>一、役職の取り合わせ</p>
                <WerewolfSet
                    userSize={props.userCount}
                    changeFnc={props.setRollSet}
                />
                <RollCustomize
                    staticRollList={props.staticRollList}
                    counterMap={props.counterMap}
                    counter={props.counter}
                    setRoll={props.setRoll}
                    setModalRoll={props.setModalRoll}
                    setModalOwnFlg={props.setModalOwnFlg}
                    turn={props.turn}
                />
            </div>
            <div className={styles.section}>
                <p className={styles.label}>二、議論のお時間</p>
                <LimitTimeSelector
                    limitTime={props.limitTime}
                    changeLimitTime={props.changeLimitTime}
                />
            </div>
            {!readiness.ready && (
                <ul className={styles.notice} role="status">
                    {readiness.messages.map((m) => (
                        <li key={m}>{m}</li>
                    ))}
                </ul>
            )}
        </section>
    );
}
