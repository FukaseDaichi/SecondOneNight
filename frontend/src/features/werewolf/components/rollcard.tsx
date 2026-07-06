import React from 'react';
import styles from '../../../styles/components/werewolf/rollcard.module.scss';
import { WerewolfRoll } from '../../../type/werewolf';
import { SystemConst } from '../../../const/next.config';

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

export default function RollCard(props: RollCardProps) {
    const name: string = getParam(
        props.roll,
        'name',
        props.roll.fakeRollList,
        props.turn,
        props.ownFlg
    );
    // カード幅から枠線(3px×2)と左右の余白(計4px)を除いた幅に収まるよう
    // フォントを縮小する。1rem=16px、字間 -0.1rem(-1.6px)を考慮
    const fitFontSize = Math.min(
        props.fontSize,
        ((props.size - 10) / Math.max(name.length, 1) + 1.6) / 16
    );
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
                    style={{ fontSize: fitFontSize + 'rem' }}
                >
                    {name}
                </span>
            </div>
        </div>
    );
}
