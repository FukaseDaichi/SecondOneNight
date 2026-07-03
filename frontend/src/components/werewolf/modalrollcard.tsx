import React from 'react';
import styles from '../../styles/components/werewolf/modalrollcard.module.scss';
import { useEffect } from 'react';
import { WerewolfRoll } from '../../type/werewolf';
import { SystemConst } from '../../const/next.config';

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

const view = () => {
    document.querySelector('body').classList.add('modal_active_overflow_view');
};

export default function ModalRollCard(props: ModalRollCardProps): JSX.Element {
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
        props.hidden();
        const dom = document.getElementById('modal-roll-area');
        if (dom) {
            dom.classList.add(styles['flip-out-hor-top']);
        }
        document
            .querySelector('body')
            .classList.remove('modal_active_overflow_view');
    };

    useEffect(() => {
        view();
        return () =>
            document.querySelector('body').classList.remove('modal_active');
    }, []);

    return (
        <div className={styles.modal}>
            <div
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
                id="modal-roll-area"
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
                        <span>勝利条件 </span>
                        <span>
                            {' '}
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
