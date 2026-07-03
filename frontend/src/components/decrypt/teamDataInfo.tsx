import React from 'react';
import styles from '../../styles/components/decrypt/teamdata.module.scss';
import { DecryptUser, TeamData } from '../../type/decrypt';
import UserDataInfo from './userDataInfo';
import SmallBtn from '../button/smallbtn';

type TeamDataProps = {
    userList: Array<DecryptUser>;
    leftTeam: TeamData;
    rightTeam: TeamData;
    turn: number;
    playerData: DecryptUser;
    gameTime: number;
    resetCode: () => void;
    choiceTeam: (teamNum: number) => void;
    resetTeam: () => void;
    modeChange: (modeNo: number) => void;
};

export default function TeamDataInfo(props: TeamDataProps): JSX.Element {
    return (
        <div className={styles.teamdatainfo}>
            <div className={styles.teamdata}>
                <h2>ブラック</h2>
                <SmallBtn value="参加" onClickFnc={() => props.choiceTeam(1)} />
                <div>
                    {props.userList
                        .filter((value: DecryptUser) => {
                            return value.teamNo === 1;
                        })
                        .map((user: DecryptUser, index: number) => {
                            return (
                                <UserDataInfo key={index} decryptUser={user} />
                            );
                        })}
                </div>
            </div>
            <div className={styles.centerarea}>
                <h2>フリーエージェント</h2>
                <SmallBtn value="暗号リセット" onClickFnc={props.resetCode} />
                <SmallBtn value="チームリセット" onClickFnc={props.resetTeam} />
                <div>
                    {props.userList
                        .filter((value: DecryptUser) => {
                            return value.teamNo === 0;
                        })
                        .map((user: DecryptUser, index: number) => {
                            return <div key={index}>{user.userName}</div>;
                        })}
                </div>
            </div>
            <div className={styles.teamdata}>
                <h2>ホワイト</h2>
                <SmallBtn value="参加" onClickFnc={() => props.choiceTeam(2)} />
                <div>
                    {props.userList
                        .filter((value: DecryptUser) => {
                            return value.teamNo === 2;
                        })
                        .map((user: DecryptUser, index: number) => {
                            return (
                                <UserDataInfo key={index} decryptUser={user} />
                            );
                        })}
                </div>
            </div>
        </div>
    );
}
