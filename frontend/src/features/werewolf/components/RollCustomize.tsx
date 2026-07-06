import styles from '../../../styles/components/werewolf/menupanel.module.scss';
import { WerewolfRoll } from '../../../type/werewolf';

type Props = {
    staticRollList: Array<WerewolfRoll>;
    counterMap: { [key: number]: number };
    counter: (rollNo: number, delta: 1 | -1) => void;
    setModalRoll: (roll: WerewolfRoll | null) => void;
    setModalOwnFlg: (value: boolean) => void;
};

// 役職カードギャラリー。カードタップで+1、−で−1、ⓘ で役職説明モーダルを開く
export default function RollCustomize({
    staticRollList,
    counterMap,
    counter,
    setModalRoll,
    setModalOwnFlg,
}: Props) {
    return (
        <div className={styles.rollGrid}>
            {staticRollList.map((element: WerewolfRoll) => {
                const count = counterMap[element.rollNo] || 0;
                return (
                    <div
                        key={element.rollNo}
                        className={`${styles.rollCard} ${
                            count > 0 ? styles.active : ''
                        }`}
                        style={{ order: element.teamNo }}
                    >
                        <button
                            className={styles.cardBody}
                            onClick={() => counter(element.rollNo, 1)}
                            aria-label={`${element.name}を1枚追加(現在${count}枚)`}
                            title={`${element.name}を1枚追加`}
                        >
                            <span className={styles.cardArt}>
                                {/* 装飾画像。役職名は下のテキストで示す */}
                                <img
                                    src={`/images/werewolf/roll/${element.rollNo}.jpg`}
                                    alt=""
                                    loading="lazy"
                                    draggable={false}
                                />
                            </span>
                            <span className={styles.cardName}>
                                {element.name}
                            </span>
                        </button>
                        {count > 0 && (
                            /* key に count を含めて枚数変更のたびにポップ演出を再生する */
                            <span
                                key={count}
                                className={styles.countBadge}
                                aria-hidden="true"
                            >
                                {count}
                            </span>
                        )}
                        <div className={styles.cardActions}>
                            <button
                                className={styles.cardStep}
                                aria-label={`${element.name}を減らす`}
                                disabled={count === 0}
                                onClick={() => counter(element.rollNo, -1)}
                            >
                                −
                            </button>
                            <button
                                className={styles.cardInfo}
                                aria-label={`${element.name}の説明を見る`}
                                onClick={() => {
                                    setModalOwnFlg(false);
                                    setModalRoll(element);
                                }}
                            >
                                ?
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
