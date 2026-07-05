import React, { useState } from 'react';
import styles from '../../../styles/components/werewolf/rollselectturn.module.scss';
import AnimationBtn from '../../../components/button/animationbtn';
import Loadingdod from '../../../components/text/loadingdod';
import { WerewolfRoll, WerewolfUser } from '../../../type/werewolf';
import RollCard from './rollcard';
import RollInfo from './rollinfo';
import { useBodyClass } from '../../../lib/useBodyClass';

const getIconImgUrl = (userNo: number, userIconUrl: string) => {
    if (userIconUrl) {
        return userIconUrl;
    }
    return '/images/icon/icon' + String(userNo) + '.jpg';
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

export default function RollSelectTurn(props: RollSelectTurnProps) {
    // 役職一覧の開閉(モバイルのみ。旧チェックボックスハックの置き換え)
    const [rollListOpen, setRollListOpen] = useState(false);
    useBodyClass('modal_active_second', props.turn === 1);

    const handRollFlg: boolean =
        props.user.handRollList && props.user.handRollList.length > 0;
    return (
        <div
            className={`${styles.rollselect} ${
                props.turn !== 1 ? styles.out : ''
            }`}
        >
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
                    <button
                        type="button"
                        aria-expanded={rollListOpen}
                        className={`${styles.rolltoggle} ${
                            rollListOpen ? styles.open : ''
                        }`}
                        onClick={() => setRollListOpen(!rollListOpen)}
                    >
                        {rollListOpen ? '閉じる' : '役職一覧'}
                    </button>
                    <div
                        className={rollListOpen ? styles.listopen : ''}
                        onClick={() => setRollListOpen(false)}
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
