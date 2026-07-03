import React from 'react';
import styles from '../../styles/components/werewolf/rollselectturn.module.scss';
import { useEffect, useState } from 'react';
import AnimationBtn from '../button/animationbtn';
import Loadingdod from '../../components/text/loadingdod';
import { WerewolfRoll, WerewolfUser } from '../../type/werewolf';
import RollCard from './rollcard';
import RollInfo from './rollinfo';

const getIconImgUrl = (userNo: number, userIconUrl: string) => {
    if (userIconUrl) {
        return userIconUrl;
    }
    return '/images/icon/icon' + String(userNo) + '.jpg';
};

const view = () => {
    document.querySelector('body').classList.add('modal_active_second');
};

const unView = () => {
    document.querySelector('body').classList.remove('modal_active_second');
    if (document.getElementById('rollselectturn-area')) {
        document
            .getElementById('rollselectturn-area')
            .classList.add(styles.out);
    }
};

type RollSelectTurnProps = {
    turn: number;
    rollList: Array<WerewolfRoll>;
    user: WerewolfUser;
    setModalRoll: (WerewolfRoll) => void;
    selectRoll: (number) => void;
    roll: WerewolfRoll;
    userList: Array<WerewolfUser>;
    setModalOwnFlg: (boolean) => void;
};

export default function RollSelectTurn(
    props: RollSelectTurnProps
): JSX.Element {
    const [turn, setTurn] = useState(0);

    if (turn !== props.turn) {
        setTurn(props.turn);
    }

    useEffect(() => {
        if (turn === 1) {
            view();
        }
        return unView;
    }, [turn]);

    const handRollFlg: boolean =
        props.user.handRollList && props.user.handRollList.length > 0;
    return (
        <div className={styles.rollselect} id="rollselectturn-area">
            <div className={styles.rollselect_background}>
                <div className={styles.turndata}>
                    {props.userList.map(
                        (element: WerewolfUser, index: number) => {
                            const turnFlg: boolean =
                                element.handRollList &&
                                element.handRollList.length === 2;
                            return (
                                <div key={index}>
                                    <div
                                        className={`${styles.imgdiv} ${
                                            turnFlg ? styles.turn : ''
                                        }`}
                                    >
                                        <img
                                            src={getIconImgUrl(
                                                element.userNo,
                                                element.userIconUrl
                                            )}
                                            alt="アイコン"
                                        />
                                    </div>
                                    <div className={styles.name}>
                                        {element.userName}
                                    </div>
                                </div>
                            );
                        }
                    )}
                    <div>
                        <div className={styles.imgdiv}>
                            <img src={getIconImgUrl(99, null)} alt="アイコン" />
                        </div>
                        <div className={styles.name}>NPC</div>
                    </div>
                </div>
                <div className={styles.area}>
                    {handRollFlg && (
                        <span
                            className={
                                handRollFlg &&
                                props.user.handRollList.length === 1
                                    ? ''
                                    : styles.none
                            }
                        >
                            待機中 <Loadingdod color={'white'} />
                        </span>
                    )}

                    {handRollFlg && (
                        <div className={styles.handrollarea}>
                            {props.user.handRollList.map(
                                (element: WerewolfRoll, index: number) => {
                                    return (
                                        <div key={index}>
                                            <RollCard
                                                roll={element}
                                                size={140}
                                                fontSize={2.0}
                                                modalView={() =>
                                                    props.setModalRoll(element)
                                                }
                                                turn={props.turn}
                                                ownFlg={false}
                                                setModalOwnFlg={
                                                    props.setModalOwnFlg
                                                }
                                            />
                                            <AnimationBtn
                                                value="選択"
                                                onClickFnc={() => {
                                                    props.selectRoll(
                                                        element.no
                                                    );
                                                }}
                                                viewFlg={
                                                    props.user.handRollList
                                                        .length === 2
                                                }
                                                animeClass="heartbeat"
                                            />
                                            {index === 1 &&
                                                props.user.userNo !== 0 && (
                                                    <div
                                                        className={styles.memo}
                                                    >
                                                        渡された役職
                                                    </div>
                                                )}
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
                    {props.roll && (
                        <div className={styles.slectedroll}>
                            <div>あなたの役職</div>

                            <RollCard
                                roll={props.roll}
                                size={140}
                                fontSize={2.0}
                                modalView={() => props.setModalRoll(props.roll)}
                                turn={props.turn}
                                ownFlg={false}
                                setModalOwnFlg={props.setModalOwnFlg}
                            />
                        </div>
                    )}
                </div>
                <div className={styles.rollinfo}>
                    <h2>他の役職を確認する</h2>
                    <input type="checkbox" id="rollviewcb" />
                    <label
                        htmlFor="rollviewcb"
                        className={styles['check-box']}
                    ></label>
                    <div
                        onClick={() => {
                            const cbDom = document.getElementById(
                                'rollviewcb'
                            ) as HTMLInputElement;
                            if (cbDom) {
                                cbDom.checked = false;
                            }
                        }}
                    >
                        <RollInfo
                            rollList={props.rollList}
                            setModalRoll={props.setModalRoll}
                            userList={props.userList}
                            turn={props.turn}
                            setModalOwnFlg={props.setModalOwnFlg}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
