import React from 'react';
import styles from '../../styles/components/werewolf/rollinfo.module.scss';
import RollCard from './rollcard';
import { WerewolfRoll, WerewolfUser } from '../../type/werewolf';

type RollInfoProps = {
    rollList: Array<WerewolfRoll>;
    setModalRoll: (WerewolfRoll) => void;
    userList: Array<WerewolfUser>;
    turn: number;
    setModalOwnFlg: (boolean) => void;
};

export default function RollInfo(props: RollInfoProps): JSX.Element {
    const rollNoList: Array<number> = [];
    return (
        <>
            <div className={styles.rollinfo}>
                {props.rollList.map((value: WerewolfRoll, index: number) => {
                    const rollNo = value.fakeRollList
                        ? value.fakeRollList[props.turn].rollNo
                        : value.rollNo;

                    if (!rollNoList.includes(rollNo)) {
                        rollNoList.push(rollNo);

                        const teamNo = value.fakeRollList
                            ? value.fakeRollList[props.turn].teamNo
                            : value.teamNo;

                        return (
                            <div
                                key={index}
                                className={styles.content}
                                style={{ order: teamNo }}
                            >
                                <RollCard
                                    roll={value}
                                    size={60}
                                    fontSize={1.2}
                                    modalView={() => props.setModalRoll(value)}
                                    turn={props.turn}
                                    ownFlg={false}
                                    setModalOwnFlg={props.setModalOwnFlg}
                                />
                                <div className={styles.rollSize}>
                                    <span>×</span>
                                    <span>
                                        {
                                            props.rollList.filter(
                                                (element: WerewolfRoll) => {
                                                    const tmpRollNo =
                                                        element.fakeRollList
                                                            ? element
                                                                  .fakeRollList[
                                                                  props.turn
                                                              ].rollNo
                                                            : element.rollNo;
                                                    return tmpRollNo === rollNo;
                                                }
                                            ).length
                                        }
                                    </span>
                                </div>
                            </div>
                        );
                    }
                })}
            </div>
            {props.userList.length + 1 < props.rollList.length && (
                <div className={styles.rollmissing}>
                    役欠け{' '}
                    <span>
                        {props.rollList.length - props.userList.length - 1}
                    </span>
                </div>
            )}
        </>
    );
}
