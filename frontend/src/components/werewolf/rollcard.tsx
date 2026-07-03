import React from 'react';
import styles from '../../styles/components/werewolf/rollcard.module.scss';
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

type RollCardProps = {
    roll: WerewolfRoll;
    size: number;
    fontSize: number;
    modalView: () => void;
    turn: number;
    ownFlg: boolean;
    setModalOwnFlg: (boolean) => void;
};

export default function RollCard(props: RollCardProps): JSX.Element {
    const rollStyle = {
        width: props.size + 'px',
        height: props.size + 'px',
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

    return (
        <div
            className={styles.rollcard}
            style={rollStyle}
            onClick={() => {
                props.setModalOwnFlg(props.ownFlg);
                props.modalView();
            }}
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
                <span
                    className={styles.rollname}
                    style={{ fontSize: props.fontSize + 'rem' }}
                >
                    {getParam(
                        props.roll,
                        'name',
                        props.roll.fakeRollList,
                        props.turn,
                        props.ownFlg
                    )}
                </span>
            </div>
        </div>
    );
}
