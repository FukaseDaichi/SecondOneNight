import React from 'react';
import styles from '../../styles/components/fakeartist/fakeartistuserinfo.module.scss';
import { FakeArtistUser } from '../../type/fakeartist';
import CircleBtn from '../button/circlebtn';
import Icon from './fakeartisticon';

const getIconImgUrl = (userNo: number, userIconUrl: string) => {
    if (userIconUrl) {
        return userIconUrl;
    }
    return '/images/icon/icon' + String(userNo) + '.jpg';
};

type FakeartistUserInfoProps = {
    gameTime: number;
    turn: number;
    user: FakeArtistUser;
    playerData: FakeArtistUser;
    changeIcon: (string: string) => void;
    vote: (userName: string) => void;
    roomRemove: (userName: string) => void;
};

export default function FakeartistUserInfo(
    props: FakeartistUserInfoProps
): JSX.Element {
    const ownFlg = props.user.userName === props.playerData.userName;
    const tebanFlg = props.gameTime === 1 && props.user.drawFlg;
    return (
        <div className={styles.userinfo}>
            {ownFlg && <span className={styles.you}>YOU</span>}
            <div className={styles.icon}>
                <Icon
                    changeIcon={props.changeIcon}
                    mainIconSrc={getIconImgUrl(
                        props.user.userNo,
                        props.user.userIconUrl
                    )}
                    deploymentFlg={
                        props.user.userName === props.playerData.userName
                    }
                />
                <div className={styles.content}>
                    <div className={styles.text}>
                        <label>{props.user.userName}</label>
                    </div>
                </div>
            </div>

            {/* 退出ボタン */}
            {(props.gameTime === 0 || props.gameTime === 4) && (
                <div className={styles.btn}>
                    <CircleBtn
                        onClickFnc={() => props.roomRemove(props.user.userName)}
                        value={'退出'}
                        size={50}
                    />
                </div>
            )}
            {/* 手番 */}
            {tebanFlg && (
                <div className={styles.artturn}>
                    <img src="/images/fakeartist/art.png" alt="役職" />
                </div>
            )}

            {/* 投票時 */}
            {props.gameTime === 3 && (
                <>
                    {!ownFlg && props.playerData.votingAbleFlg && (
                        <div className={styles.btn}>
                            <CircleBtn
                                onClickFnc={() =>
                                    props.vote(props.user.userName)
                                }
                                value={'投票'}
                                size={50}
                            />
                        </div>
                    )}
                    <div
                        className={`${styles.rollcard} ${
                            props.user.punishmentFlg && styles.punishment
                        }`}
                    >
                        <div className={styles.back}>
                            {ownFlg && (
                                <img
                                    src="/images/werewolf/back.png"
                                    alt="役職"
                                />
                            )}
                            <img
                                src="/images/werewolf/back.png"
                                alt="シークレット"
                            />
                        </div>

                        {props.user.punishmentFlg && (
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
                </>
            )}
        </div>
    );
}
