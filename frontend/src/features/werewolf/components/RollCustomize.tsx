import CircleBtn from '../../../components/button/circlebtn';
import RollCard from './rollcard';
import styles from '../../../styles/components/werewolf/room.module.scss';
import { WerewolfRoll } from '../../../type/werewolf';

type Props = {
    staticRollList: Array<WerewolfRoll>;
    counterMap: { [key: number]: number };
    counter: (rollNo: number, delta: 1 | -1) => void;
    setRoll: () => void;
    setModalRoll: (roll: WerewolfRoll | null) => void;
    setModalOwnFlg: (value: boolean) => void;
    turn: number;
};

export default function RollCustomize({
    staticRollList,
    counterMap,
    counter,
    setRoll,
    setModalRoll,
    setModalOwnFlg,
    turn,
}: Props) {
    return (
        <div className={styles.rollselect}>
            <div className={styles.title}>
                役職カスタマイズ{'　　　　'}
                <CircleBtn value="設定" size={48} onClickFnc={setRoll} />
            </div>
            {staticRollList.map((element: WerewolfRoll, index: number) => {
                return (
                    <div key={index} style={{ order: element.teamNo }}>
                        <RollCard
                            roll={element}
                            size={60}
                            fontSize={1.2}
                            modalView={() => setModalRoll(element)}
                            turn={turn}
                            ownFlg={false}
                            setModalOwnFlg={setModalOwnFlg}
                        />
                        <div className={styles.counter}>
                            <div
                                className={styles.counterbtn}
                                onClick={() => {
                                    counter(element.rollNo, -1);
                                }}
                            >
                                -
                            </div>
                            <div className={styles.number}>
                                {counterMap[element.rollNo] || 0}
                            </div>
                            <div
                                className={styles.counterbtn}
                                onClick={() => {
                                    counter(element.rollNo, 1);
                                }}
                            >
                                +
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
