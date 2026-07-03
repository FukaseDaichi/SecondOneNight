import React from 'react';
import styles from '../../styles/components/hideout/userinfo.module.scss';
import { useState } from 'react';
import HoloCard from '../../components/card/holoCard';
import HideoutIcon from './hideouticon';
import BuildCard from '../../components/hideout/buildcard';

// ハイドアウト用

const getIconImgUrl = (userNo: number, userIconUrl: string) => {
    if (userIconUrl) {
        return userIconUrl;
    }
    return '/images/icon/icon' + String(userNo) + '.jpg';
};

const getRollImgUrl = (rollType: number) => {
    let url = null;

    switch (rollType) {
        case 1:
            url = '/images/hideout/swat.png';
            break;
        case 2:
            url = '/images/hideout/terrorist.png';
            break;
    }
    return url;
};

const getRollMarkImgUrl = (rollType: number) => {
    let url = null;

    switch (rollType) {
        case 1:
            url = '/images/hideout/swatmark.png';
            break;
        case 2:
            url = '/images/hideout/terroristmark.png';
            break;
    }
    return url;
};

type UserInfoProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any;
    ownFlg: boolean;
    userColor: string;
    changeIcon: (string) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userList: Array<any>;
    wait: (number) => void;
    winnerTeam: number;
    turn: number;
};

export default function UserInfo(props: UserInfoProps): JSX.Element {
    const [infoFlg, setInfoFlg] = useState(false);

    const divStyles = {
        borderColor: props.userColor,
        color: props.userColor,
    };
    const divTurnStyles = {
        borderColor: props.userColor,
        color: props.userColor,
        backgroundColor: 'rgb(229,245,228)',
    };
    return (
        <div
            className={`${styles.main}`}
            style={props.user.turnFlg ? divTurnStyles : divStyles}
        >
            {props.ownFlg && <span className={styles.you}>YOU!</span>}
            <div className={styles.icon}>
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

                    {props.ownFlg && props.turn > 0 && (
                        <div className={styles.btnarea}>
                            <div
                                className={styles.btn}
                                style={{ backgroundColor: props.userColor }}
                            >
                                <input type="checkbox" id="chk1" />
                                <label
                                    htmlFor="chk1"
                                    onClick={() => {
                                        const checkDom =
                                            document.getElementById(
                                                'chk1'
                                            ) as HTMLInputElement;

                                        setInfoFlg(!checkDom.checked);
                                    }}
                                >
                                    <div className={styles.hamberger}>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {props.user.turnFlg && (
                <div className={styles.turn}>
                    <img src={'/images/hideout/handgun.png'} alt="手番" />
                </div>
            )}
            {props.winnerTeam > 0 && (
                <div className={styles.roll}>
                    <img
                        src={getRollMarkImgUrl(props.user.userRoleNo)}
                        alt="役職マーク"
                    />
                </div>
            )}
            {infoFlg && (
                <div
                    className={`${styles.card} ${
                        props.user.userNo % 2 === 0 ? styles.even : ''
                    }`}
                    onClick={() => {
                        const checkDom = document.getElementById(
                            'chk1'
                        ) as HTMLInputElement;
                        checkDom.checked = false;
                        setInfoFlg(false);
                    }}
                >
                    <div className={styles['card-roll']}>
                        <HoloCard
                            width={290}
                            height={295}
                            imgUrl={getRollImgUrl(props.user.userRoleNo)}
                            rareFlg={false}
                            borderRadius={39}
                        />
                    </div>
                </div>
            )}
            {props.user.buildingCard && (
                <BuildCard
                    wait={props.wait}
                    userList={props.userList}
                    buildingCard={props.user.buildingCard}
                    waitUserIndexList={props.user.waitUserIndexList}
                    ownFlg={props.ownFlg}
                />
            )}
        </div>
    );
}
