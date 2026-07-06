import React, { useState } from 'react';
import styles from '../../../styles/components/werewolf/modalrollcard.module.scss';
import { WerewolfRoll } from '../../../type/werewolf';
import { SystemConst } from '../../../const/next.config';
import { useBodyClass } from '../../../lib/useBodyClass';

const getParam = (
    roll: WerewolfRoll,
    param: string,
    fakeRollList: Array<WerewolfRoll>,
    turn: number,
    ownFlg: boolean
) => {
    if (fakeRollList && !ownFlg) {
        return fakeRollList[turn][param];
    } else {
        return roll[param];
    }
};

type ModalRollCardProps = {
    roll: WerewolfRoll;
    turn: number;
    ownFlg: boolean;
    hidden: () => void;
};

export default function ModalRollCard(props: ModalRollCardProps) {
    const [closing, setClosing] = useState(false);
    useBodyClass('modal_active_overflow_view', true);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const rollStyle = {
        border: `3px solid ${
            SystemConst.TEAM_COLOR_LIST[
                getParam(
                    props.roll,
                    'teamNo',
                    props.roll.fakeRollList,
                    props.turn,
                    props.ownFlg
                )
            ]
        }`,
    };

    const unView = () => {
        setClosing(true);
        props.hidden();
    };

    return (
        <div className={styles.modal}>
            <div
                className={closing ? styles['flip-out-hor-top'] : ''}
                style={{
                    backgroundColor:
                        SystemConst.TEAM_COLOR_LIST[
                            getParam(
                                props.roll,
                                'teamNo',
                                props.roll.fakeRollList,
                                props.turn,
                                props.ownFlg
                            )
                        ],
                }}
                onClick={unView}
            >
                <div
                    className={styles.imgdiv}
                    style={{
                        backgroundImage: `url(/images/werewolf/roll/${getParam(
                            props.roll,
                            'rollNo',
                            props.roll.fakeRollList,
                            props.turn,
                            props.ownFlg
                        )}.jpg)`,
                    }}
                >
                    <div className={styles.rollname}>
                        {getParam(
                            props.roll,
                            'name',
                            props.roll.fakeRollList,
                            props.turn,
                            props.ownFlg
                        )}
                    </div>
                </div>

                <div className={styles.info}>
                    <div className={styles.winDescription}>
                        <span>勝利条件</span>
                        <span>
                            {getParam(
                                props.roll,
                                'winDescription',
                                props.roll.fakeRollList,
                                props.turn,
                                props.ownFlg
                            )}
                        </span>
                    </div>
                    <div>
                        {getParam(
                            props.roll,
                            'description',
                            props.roll.fakeRollList,
                            props.turn,
                            props.ownFlg
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
