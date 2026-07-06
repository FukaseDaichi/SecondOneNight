import React, { useEffect, useState } from 'react';
import styles from '../../../styles/components/werewolf/userinfo.module.scss';
import IconPicker from '../../../components/common/IconPicker';
import { WerewolfUser } from '../../../type/werewolf';
import RollCard from './rollcard';
import CircleBtn from '../../../components/button/circlebtn';
import WinText from '../../../components/text/wintext';

// 人狼用

const getIconImgUrl = (userIconUrl: string) => {
    if (userIconUrl) {
        return userIconUrl;
    }
    return '/images/icon/icon0.jpg';
};

/* 名前の文字数に応じて段階的に縮小する(最大20文字を2行で収める) */
const getNameSizeClass = (userName: string) => {
    const len = userName ? userName.length : 0;
    if (len <= 4) {
        return '';
    }
    if (len <= 8) {
        return styles.namemid;
    }
    if (len <= 13) {
        return styles.namesmall;
    }
    return styles.namexs;
};

type UserInfoProps = {
    playerData: WerewolfUser;
    user: WerewolfUser;
    ownFlg: boolean;
    hostFlg?: boolean;
    userColor: string;
    changeIcon: (string) => void;
    setModalRoll: (WerewolfRoll) => void;
    userAction: (string) => void;
    turn: number;
    playerActionName: string;
    winteamList: Array<number>;
    setModalOwnFlg: (boolean) => void;
    removeUser?: (userName: string) => void;
};

export default function UserInfo(props: UserInfoProps) {
    // プレイヤーカラーは CSS 変数で渡す(通常時はカード枠、ロビー中はアバターの輪に使う)
    const divStyles = {
        '--player-color': props.userColor,
        color: props.userColor,
    } as React.CSSProperties;
    const lobby = props.turn === 0 || props.turn === 4;

    // つつき演出(ローカルのみ・通信なし)。ロビー中に他人のアバターをタップすると揺れる
    const [poked, setPoked] = useState(false);
    useEffect(() => {
        if (!poked) {
            return;
        }
        const id = window.setTimeout(() => setPoked(false), 500);
        return () => window.clearTimeout(id);
    }, [poked]);

    return (
        <div
            className={`${styles.main} ${props.ownFlg ? styles.own : ''} ${
                lobby ? styles.enter : ''
            }`}
            style={divStyles}
        >
            {props.ownFlg && <span className={styles.you}>YOU</span>}
            {props.hostFlg && lobby && (
                <span className={styles.host} title="部屋主">
                    主
                </span>
            )}
            {props.removeUser &&
                !props.ownFlg &&
                (props.turn === 0 || props.turn === 4) && (
                    <button
                        className={styles.kick}
                        aria-label={`${props.user.userName}を退出させる`}
                        onClick={() => {
                            if (
                                window.confirm(
                                    `「${props.user.userName}」を退出させますか?`
                                )
                            ) {
                                props.removeUser?.(props.user.userName);
                            }
                        }}
                    >
                        ✕
                    </button>
                )}
            <div className={styles.icon}>
                {props.user.roll &&
                    props.winteamList.includes(props.user.roll.teamNo) && (
                        <div className={styles.win}>
                            <WinText />
                        </div>
                    )}
                {props.ownFlg ? (
                    <IconPicker
                        changeIcon={props.changeIcon}
                        mainIconSrc={getIconImgUrl(props.user.userIconUrl)}
                    />
                ) : (
                    <div
                        className={`${styles.imgdiv} ${
                            poked ? styles.poked : ''
                        }`}
                        onClick={lobby ? () => setPoked(true) : undefined}
                    >
                        <img
                            src={getIconImgUrl(props.user.userIconUrl)}
                            alt="アイコン"
                        />
                    </div>
                )}
                <div className={styles.content}>
                    <div
                        className={`${styles.text} ${getNameSizeClass(
                            props.user.userName
                        )}`}
                    >
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
