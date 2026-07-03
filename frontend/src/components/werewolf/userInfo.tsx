/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import styles from '../../styles/components/werewolf/userinfo.module.scss';
import { useState } from 'react';
import HideoutIcon from '../hideout/hideouticon';
import { WerewolfUser } from '../../type/werewolf';
import RollCard from './rollcard';
import CircleBtn from '../button/circlebtn';
import WinText from '../text/wintext';

// 人狼用

const getIconImgUrl = (userNo: number, userIconUrl: string) => {
    if (userIconUrl) {
        return userIconUrl;
    }
    return '/images/icon/icon0.jpg';
};

type UserInfoProps = {
    playerData: WerewolfUser;
    user: WerewolfUser;
    ownFlg: boolean;
    userColor: string;
    changeIcon: (string) => void;
    setModalRoll: (WerewolfRoll) => void;
    userAction: (string) => void;
    turn: number;
    playerActionName: string;
    winteamList: Array<number>;
    setModalOwnFlg: (boolean) => void;
};

export default function UserInfo(props: UserInfoProps): JSX.Element {
    const [infoFlg, setInfoFlg] = useState(false);

    const divStyles = {
        borderColor: props.userColor,
        color: props.userColor,
    };

    return (
        <div className={`${styles.main}`} style={divStyles}>
            {props.ownFlg && <span className={styles.you}>YOU</span>}
            <div className={styles.icon}>
                {props.user.roll &&
                    props.winteamList.includes(props.user.roll.teamNo) && (
                        <div className={styles.win}>
                            <WinText />
                        </div>
                    )}
                {props.ownFlg ? (
                    <HideoutIcon
                        changeIcon={props.changeIcon}
                        mainIconSrc={getIconImgUrl(
                            props.user.userNo,
                            props.user.userIconUrl
                        )}
                    />
                ) : (
                    <div className={styles.imgdiv}>
                        <img
                            src={getIconImgUrl(
                                props.user.userNo,
                                props.user.userIconUrl
                            )}
                            alt="アイコン"
                        />
                    </div>
                )}
                <div className={styles.content}>
                    <div className={styles.text}>
                        <label>{props.user.userName}</label>
                    </div>
                </div>
            </div>

            {props.playerActionName && !props.ownFlg && (
                <div className={styles.btn}>
                    <CircleBtn
                        onClickFnc={() => props.userAction(props.user.userName)}
                        value={props.playerActionName}
                        size={50}
                    />
                </div>
            )}
            {props.user.roll && (
                <div
                    className={`${styles.rollcard} ${
                        props.user.roll.punishmentFlg && styles.punishment
                    }`}
                >
                    {props.ownFlg ||
                    props.user.roll.openTargetUsernameList.includes(
                        props.playerData.userName
                    ) ||
                    props.user.roll.openFlg ? (
                        <RollCard
                            size={100}
                            roll={props.user.roll}
                            fontSize={2}
                            modalView={() => {
                                props.setModalRoll(props.user.roll);
                            }}
                            turn={props.turn}
                            ownFlg={props.ownFlg}
                            setModalOwnFlg={props.setModalOwnFlg}
                        />
                    ) : (
                        <div className={styles.back}>
                            <img
                                src="/images/werewolf/back.png"
                                alt="シークレット"
                            />
                        </div>
                    )}
                    {props.user.roll.punishmentFlg && (
                        <div
                            className={`${styles.back} ${styles.punishmentimgdiv}`}
                        >
                            <img
                                src="/images/werewolf/punishment.png"
                                alt="処刑"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
