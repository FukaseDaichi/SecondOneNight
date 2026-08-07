import React, { useCallback, useEffect, useState } from 'react';
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

    const hidden = props.hidden;
    const unView = useCallback(() => {
        setClosing(true);
        hidden();
    }, [hidden]);

    // Esc で閉じる(背景タップ・✕・カード面タップと同じ導線)
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                unView();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [unView]);

    const rollName = getParam(
        props.roll,
        'name',
        props.roll.fakeRollList,
        props.turn,
        props.ownFlg
    );

    return (
        // 背景(オーバーレイ)タップで閉じる。カード面のタップも従来どおり
        // ここまでバブリングして閉じるため、内側に個別のハンドラは持たせない
        <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label={`${rollName}の詳細`}
            onClick={unView}
        >
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
            >
                <button
                    type="button"
                    className={styles.close}
                    aria-label="閉じる"
                    onClick={(e) => {
                        e.stopPropagation();
                        unView();
                    }}
                >
                    ✕
                </button>
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
                    <div className={styles.rollname}>{rollName}</div>
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
