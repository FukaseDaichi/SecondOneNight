/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import styles from '../../styles/components/hideout/rushturn.module.scss';
import { useEffect } from 'react';
import HoloCard from '../card/holoCard';
import { SystemConst } from '../../const/next.config';
import Loadingdod from '../../components/text/loadingdod';

const getMemberImgUrl = (cardType: number) => {
    let url = null;

    switch (cardType) {
        case 2:
            url = '/images/hideout/exterroristcard.png';
            break;
        case 1:
            url = '/images/hideout/terroristcard.png';
            break;
        case 0:
            url = '/images/hideout/swatcard.png';
            break;
        case -1:
            url = '/images/hideout/exswatcard.png';
            break;
    }
    return url;
};

const getIconImgUrl = (userNo: number, userIconUrl: string) => {
    if (userIconUrl) {
        return userIconUrl;
    }
    return '/images/icon/icon' + String(userNo) + '.jpg';
};

const view = () => {
    document.querySelector('body').classList.add('modal_active');
};

const unView = () => {
    document.querySelector('body').classList.remove('modal_active');
};

type RushTurnProps = {
    rush: (number) => void;
    userList: Array<any>;
    playerName: string;
    memberFirldList: Array<any>;
    endFnc: () => void;
};

export default function RushTrun(props: RushTurnProps): JSX.Element {
    let userIndex = 0;
    props.userList.forEach((value, index) => {
        if (value.userName === props.playerName) {
            userIndex = index;
        }
    });

    const haveFlg: boolean =
        props.userList[userIndex] &&
        props.userList[userIndex].memberCardList &&
        props.userList[userIndex].memberCardList.length > 0;

    const rushFinalFlg: boolean =
        props.memberFirldList && props.memberFirldList.length > 3;

    if (rushFinalFlg) {
        scrollTo(0, 0);
    }

    const result = props.memberFirldList.reduce((sum, element) => {
        return sum + element.cardType;
    }, 0);

    useEffect(() => {
        view();
        return () => unView();
    }, []);

    const end = () => {
        if (rushFinalFlg) {
            document.getElementById('rush-time-area').classList.add(styles.out);
            setTimeout(() => props.endFnc(), 1000);
            unView();
        }
    };

    return (
        <div className={styles.rush} onClick={end} id="rush-time-area">
            <div className={styles.rush_background}>
                <div className={styles.area}>
                    {!rushFinalFlg ? (
                        <h1>RUSH TIME</h1>
                    ) : result > 0 ? (
                        <h1 className={styles.failed}>FAILED</h1>
                    ) : (
                        <h1 className={styles.open}>OPEN!!</h1>
                    )}
                    {!rushFinalFlg &&
                        (haveFlg ? (
                            <h1>
                                CHOICE{' '}
                                {
                                    props.userList[
                                        userIndex
                                    ].memberCardList.filter((x) => x.consumeFlg)
                                        .length
                                }{' '}
                                /{' '}
                                {props.userList[userIndex].memberCardList
                                    .length / 2}
                            </h1>
                        ) : (
                            <h1>
                                WAIT
                                <Loadingdod color={'white'} />
                            </h1>
                        ))}
                    {!rushFinalFlg && (
                        <div
                            className={`${styles.handcard} ${
                                haveFlg &&
                                props.userList[userIndex].memberCardList
                                    .length > 2
                                    ? styles.oversize
                                    : ''
                            }`}
                        >
                            {haveFlg &&
                                !rushFinalFlg &&
                                props.userList[userIndex].memberCardList.map(
                                    (value, index) => {
                                        return (
                                            <div
                                                key={index}
                                                onClick={() =>
                                                    props.rush(value.no)
                                                }
                                                className={
                                                    value.consumeFlg
                                                        ? styles.trash
                                                        : ''
                                                }
                                            >
                                                <HoloCard
                                                    width={150}
                                                    height={210}
                                                    imgUrl={getMemberImgUrl(
                                                        value.cardType
                                                    )}
                                                    borderRadius={20}
                                                    rareFlg={
                                                        value.cardType === 2 ||
                                                        value.cardType === -1
                                                    }
                                                />
                                            </div>
                                        );
                                    }
                                )}
                        </div>
                    )}
                    {rushFinalFlg && (
                        <div className={styles.firldmemnber}>
                            {props.memberFirldList.map((member, index) => {
                                return (
                                    <div key={index}>
                                        <div className={styles.card}>
                                            <HoloCard
                                                width={150}
                                                height={210}
                                                imgUrl={getMemberImgUrl(
                                                    member.cardType
                                                )}
                                                borderRadius={20}
                                                rareFlg={
                                                    member.cardType === 2 ||
                                                    member.cardType === -1
                                                }
                                            />
                                        </div>
                                        <div
                                            className={styles.imgdiv}
                                            style={{
                                                borderColor:
                                                    SystemConst
                                                        .PLAYER_COLOR_LIST[
                                                        member.haveUserIndex
                                                    ],
                                            }}
                                        >
                                            <img
                                                src={getIconImgUrl(
                                                    props.userList[
                                                        member.haveUserIndex
                                                    ].userNo,
                                                    props.userList[
                                                        member.haveUserIndex
                                                    ].userIconUrl
                                                )}
                                                alt="待機アイコン"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
