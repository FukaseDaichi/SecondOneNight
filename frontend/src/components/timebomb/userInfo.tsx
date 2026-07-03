import React, { useMemo } from 'react';
import { TimeBombUser, LeadCards } from '../../type';
import styles from '../../styles/components/timebomb/userinfo.module.scss';
import Icon from '../../components/userInfo/icon';

import { useState } from 'react';

const getImgUrl = (cardType: number) => {
    let url = null;

    switch (cardType) {
        case 1:
            url = '/images/release.png';
            break;
        case 2:
            url = '/images/bomb.png';
            break;
        case 3:
            url = '/images/common.png';
            break;
    }
    return url;
};

const getCardTypeSize = (cardlist: Array<LeadCards>, cardType: number) => {
    if (!cardlist) {
        return 0;
    }

    return cardlist.filter((element) => {
        return element.cardType === cardType;
    }).length;
};

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
            url = '/images/timepolice.png';
            break;
        case 2:
            url = '/images/bommer.png';
            break;
    }
    return url;
};

const getRollMarkImgUrl = (rollType: number) => {
    let url = null;

    switch (rollType) {
        case 1:
            url = '/images/Pmark.png';
            break;
        case 2:
            url = '/images/Bmark.png';
            break;
    }
    return url;
};

type UserInfoProps = {
    user: TimeBombUser;
    cardlist: Array<LeadCards>;
    ownFlg: boolean;
    round: number;
    endFlg: boolean;
    playfnc: (cardIndex: number) => void;
    changeIcon: (url: string) => void;
    secretFlg: boolean;
    startFlg: boolean;
};

export default function UserInfo(userInfoProps: UserInfoProps): JSX.Element {
    const [infoFlg, setInfoFlg] = useState(false);

    const releaseCount: number = useMemo(
        () => getCardTypeSize(userInfoProps.cardlist, 1),
        [userInfoProps.round, userInfoProps.startFlg]
    );
    const bombCount: number = useMemo(
        () => getCardTypeSize(userInfoProps.cardlist, 2),
        [userInfoProps.round, userInfoProps.startFlg]
    );

    const UserCard = React.memo(function userCard() {
        return (
            <div
                className={styles.card}
                onClick={() => {
                    const checkDom = document.getElementById(
                        'chk1'
                    ) as HTMLInputElement;
                    checkDom.checked = false;
                    setInfoFlg(false);
                }}
            >
                <div>
                    <div
                        className={styles['card-roll']}
                        style={{
                            backgroundImage: `url(${getRollImgUrl(
                                userInfoProps.user.userRoleNo
                            )})`,
                        }}
                    ></div>
                </div>
            </div>
        );
    });

    return (
        <div
            className={`${styles.main} ${
                userInfoProps.user.turnFlg && styles.turn
            } ${userInfoProps.ownFlg && styles.own}`}
        >
            <div className={styles.icon}>
                {userInfoProps.ownFlg ? (
                    <Icon
                        mainIconSrc={getIconImgUrl(
                            userInfoProps.user.userNo,
                            userInfoProps.user.userIconUrl
                        )}
                        changeIcon={userInfoProps.changeIcon}
                    />
                ) : (
                    <div className={styles.imgdiv}>
                        <img
                            src={getIconImgUrl(
                                userInfoProps.user.userNo,
                                userInfoProps.user.userIconUrl
                            )}
                            alt="アイコン"
                        />
                    </div>
                )}
                <div className={styles.content}>
                    <div className={styles.text}>
                        <label>{userInfoProps.user.userName}</label>
                        {userInfoProps.ownFlg && <span>YOU!</span>}
                    </div>

                    {userInfoProps.ownFlg && userInfoProps.user.userRoleNo > 0 && (
                        <div className={styles.btnarea}>
                            <div className={styles.btn}>
                                <input type="checkbox" id="chk1" />
                                <label
                                    htmlFor="chk1"
                                    onClick={() => {
                                        const checkDom =
                                            document.getElementById(
                                                'chk1'
                                            ) as HTMLInputElement;
                                        const checkFlg = checkDom.checked;
                                        setInfoFlg(!checkFlg);
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
            {userInfoProps.user.turnFlg && (
                <div className={styles.turn}>
                    <img src={'/images/hasami.png'} alt="手番" />
                </div>
            )}
            {userInfoProps.ownFlg && infoFlg && <UserCard />}
            {userInfoProps.endFlg && (
                <div className={styles.roll}>
                    <img
                        src={getRollMarkImgUrl(userInfoProps.user.userRoleNo)}
                        alt="役職マーク"
                    />
                </div>
            )}
            {userInfoProps.round > 0 && userInfoProps.ownFlg && (
                <div className={styles.ownroll}>
                    <img
                        src={getRollMarkImgUrl(userInfoProps.user.userRoleNo)}
                        alt="役職マーク"
                    />
                </div>
            )}
            <div className={`row ${styles.handcatd}`}>
                {userInfoProps.cardlist.map(
                    (value: LeadCards, index: number) => {
                        const id: string =
                            (userInfoProps.user.userNo - 1) *
                                (6 - userInfoProps.round) +
                            index +
                            '_cards';
                        return (
                            <div
                                key={index}
                                onClick={(event) => {
                                    const targetDom: HTMLElement =
                                        event.target as HTMLElement;
                                    const hereDomId: string =
                                        targetDom.parentElement.id;
                                    userInfoProps.playfnc(
                                        Number(hereDomId.split('_')[0])
                                    );
                                }}
                                id={id}
                                className={value.openFlg ? styles.opend : ''}
                            >
                                {userInfoProps.ownFlg &&
                                !userInfoProps.secretFlg ? (
                                    <img
                                        src={getImgUrl(value.cardType)}
                                        alt="あなたの裏カード"
                                        className={styles.gray}
                                    />
                                ) : (
                                    <img
                                        src="/images/back.png"
                                        alt="裏カード"
                                        className={`${
                                            userInfoProps.ownFlg &&
                                            userInfoProps.secretFlg &&
                                            styles.gray
                                        }`}
                                    />
                                )}
                                <img
                                    src={getImgUrl(value.cardType)}
                                    alt="表カード"
                                />
                            </div>
                        );
                    }
                )}
            </div>
            {userInfoProps.cardlist.length > 0 &&
                userInfoProps.ownFlg &&
                userInfoProps.secretFlg && (
                    <div className={styles.secretMode}>
                        <div>
                            <div>
                                <img src={getImgUrl(1)} alt="解除" />
                            </div>
                            <span>× {releaseCount}</span>
                        </div>
                        <div>
                            <div>
                                <img src={getImgUrl(2)} alt="爆弾" />
                            </div>
                            <span>× {bombCount}</span>
                        </div>
                    </div>
                )}
        </div>
    );
}
