/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import styles from '../../styles/components/hideout/buildcard.module.scss';
import { SystemConst } from '../../const/next.config';
import { useEffect, useState } from 'react';

const getBuildImgUrl = (cardType: number) => {
    let url = null;

    switch (cardType) {
        case 1:
            url = '/images/hideout/hideout.png';
            break;
        case 2:
            url = '/images/hideout/dummy.png';
            break;
        case 3:
            url = '/images/hideout/bomb.png';
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

type BuildingCardProps = {
    buildingCard: any;
    waitUserIndexList: Array<number>;
    userList: Array<any>;
    ownFlg: boolean;
    wait: (no: number) => void;
};

export default function BuildCard(props: BuildingCardProps): JSX.Element {
    const [waitSize, setWaitSize] = useState(0);
    if (waitSize !== props.waitUserIndexList.length) {
        setWaitSize(props.waitUserIndexList.length);
    }
    useEffect(() => {
        if (waitSize !== 0) {
            const id: string = 'buildcard_' + props.buildingCard.no;
            document.getElementById(id).classList.add(styles.waitanime);
            setTimeout(function () {
                document.getElementById(id).classList.remove(styles.waitanime);
            }, 800);
        }
    }, [waitSize]);

    return (
        <div
            className={`${styles.buildcard} ${
                props.buildingCard.openFlg ? styles.opened : ''
            }`}
            onClick={() => props.wait(props.buildingCard.no)}
            id={'buildcard_' + props.buildingCard.no}
        >
            {props.ownFlg ? (
                <div>
                    <img
                        src={getBuildImgUrl(props.buildingCard.cardType)}
                        className={`${styles.front} ${styles.own}`}
                        alt="建物"
                    />
                </div>
            ) : (
                <img
                    src="/images/hideout/back.png"
                    alt="背面"
                    className={styles.front}
                />
            )}

            <img
                src={getBuildImgUrl(props.buildingCard.cardType)}
                className={styles.back}
                alt="建物"
            />
            <div className={styles.wait}>
                {props.waitUserIndexList.map((value: number, index: number) => {
                    return (
                        <div
                            className={styles.imgdiv}
                            style={{
                                borderColor:
                                    SystemConst.PLAYER_COLOR_LIST[value],
                            }}
                            key={index}
                        >
                            <img
                                src={getIconImgUrl(
                                    props.userList[value].userNo,
                                    props.userList[value].userIconUrl
                                )}
                                alt="待機アイコン"
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
