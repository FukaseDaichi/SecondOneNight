import React, { BaseSyntheticEvent } from 'react';
import styles from '../../styles/components/fakeartist/userinfoshort.module.scss';
import { FakeArtistUser } from '../../type/fakeartist';

type UserInfoShortProps = {
    gameTime: number;
    turn: number;
    user: FakeArtistUser;
    playerData: FakeArtistUser;
    changeIcon: (string: string) => void;
    vote: (userName: string) => void;
    roomRemove: (userName: string) => void;
    mouseon: (userName: string) => void;
    mouseout: () => void;
};

export default function UserInfoShort(props: UserInfoShortProps): JSX.Element {
    const tebanFlg = props.gameTime === 1 && props.user.drawFlg;
    const unviewFlg = props.gameTime === 1 && !props.user.drawFlg;
    const ownFlg = props.user.userName === props.playerData.userName;

    const voteFlg =
        props.gameTime === 3 && props.playerData.votingAbleFlg && !ownFlg;

    const fakeFlg =
        (props.user.rollNo === 2 && ownFlg) ||
        (props.user.rollNo === 2 && props.gameTime === 4);

    return (
        <div
            className={`${styles.userinfoshort} ${tebanFlg && styles.turn} ${
                unviewFlg && styles.unview
            } ${voteFlg && styles.vote} ${
                props.user.punishmentFlg && styles.punishment
            }`}
            onMouseDown={() => {
                if (props.gameTime === 2) {
                    props.mouseon(props.user.userName);
                }
            }}
            onMouseUp={() => {
                if (props.gameTime === 2) {
                    props.mouseout();
                }
            }}
            onTouchStart={() => {
                if (props.gameTime === 2) {
                    props.mouseon(props.user.userName);
                }
            }}
            onTouchEnd={() => {
                if (props.gameTime === 2) {
                    props.mouseout();
                }
            }}
        >
            {ownFlg && <p className={styles.you}>YOU</p>}
            <div
                className={styles.icon}
                onClick={(e: BaseSyntheticEvent) => {
                    if (voteFlg) {
                        e.target.classList.add(styles.voted);
                        props.vote(props.user.userName);

                        window.setTimeout(() => {
                            e.target.classList.remove(styles.voted);
                        }, 1000);
                    }
                }}
            >
                <img src={props.user.userIconUrl} alt="アイコン" />
            </div>
            {props.user.punishmentFlg && (
                <div className={styles.punishmentimgdiv}>
                    <img src="/images/werewolf/punishment.png" alt="処刑" />
                </div>
            )}
            <p className={styles.name}>{props.user.userName}</p>
            {fakeFlg && (
                <img
                    className={styles.fake}
                    src="/images/fakeartist/fake.png"
                    alt="fake"
                />
            )}
        </div>
    );
}
