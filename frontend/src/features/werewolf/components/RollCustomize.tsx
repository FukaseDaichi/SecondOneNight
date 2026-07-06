import styles from '../../../styles/components/werewolf/menupanel.module.scss';
import { WerewolfRoll } from '../../../type/werewolf';

type Props = {
    staticRollList: Array<WerewolfRoll>;
    counterMap: { [key: number]: number };
    counter: (rollNo: number, delta: 1 | -1) => void;
    setModalRoll: (roll: WerewolfRoll | null) => void;
    setModalOwnFlg: (value: boolean) => void;
};

/* 役職チップの漢字バッジ(役職名 → 一字)。未登録の役職は先頭一字で代用 */
const ROLL_KANJI: Record<string, string> = {
    人狼: '狼',
    村人: '村',
    村長: '長',
    てるてる: '照',
    狂人: '狂',
    独裁者: '独',
    狂信者: '信',
    占い師: '占',
    付き人: '付',
    暗殺者: '暗',
    怪盗: '盗',
    白狼: '白',
};

// 役職チップの一覧。名前タップで役職説明モーダル、−/+ で枚数を調整する
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
                        className={`${styles.rollChip} ${
                            count > 0 ? styles.active : ''
                        }`}
                        style={{ order: element.teamNo }}
                    >
                        <button
                            className={styles.rollName}
                            onClick={() => {
                                setModalOwnFlg(false);
                                setModalRoll(element);
                            }}
                            title={`${element.name}の説明を見る`}
                        >
                            <span className={styles.rollBadge}>
                                {ROLL_KANJI[element.name] ??
                                    element.name.charAt(0)}
                            </span>
                            {element.name}
                        </button>
                        <div className={styles.rollCounter}>
                            <button
                                className={styles.step}
                                aria-label={`${element.name}を減らす`}
                                onClick={() => counter(element.rollNo, -1)}
                            >
                                −
                            </button>
                            <span className={styles.count}>{count}</span>
                            <button
                                className={styles.step}
                                aria-label={`${element.name}を増やす`}
                                onClick={() => counter(element.rollNo, 1)}
                            >
                                +
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
