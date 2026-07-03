import React from 'react';
import styles from '../../styles/components/werewolf/result.module.scss';
import { WerewolfUser } from '../../type/werewolf';

type ResultProps = {
    userList: Array<WerewolfUser>;
    winteamList: Array<number>;
    npcuser: WerewolfUser;
    endFnc: () => void;
};

export default function Result(props: ResultProps): JSX.Element {
    return (
        <div className={styles.result} onClick={props.endFnc}>
            <div>
                <div>
                    <table className="table table-dark">
                        <thead>
                            <tr>
                                <th scope="col">名前</th>
                                <th scope="col">役職</th>
                                <th scope="col">票数</th>
                                <th scope="col">スコア</th>
                                <th scope="col">行動</th>
                            </tr>
                        </thead>
                        <tbody>
                            {props.userList.map(
                                (element: WerewolfUser, index: number) => {
                                    return (
                                        <tr
                                            key={index}
                                            className={
                                                element.roll &&
                                                props.winteamList.includes(
                                                    element.roll.teamNo
                                                )
                                                    ? styles.win
                                                    : ''
                                            }
                                        >
                                            <td>{element.userName}</td>
                                            <td>
                                                {element.roll
                                                    ? element.roll.name
                                                    : 'なし'}
                                            </td>
                                            <td>
                                                {element.roll
                                                    ? element.roll.votingCount
                                                    : 'なし'}
                                            </td>
                                            <td>{element.score}</td>
                                            <td>
                                                {element.lastMessage
                                                    ? element.lastMessage
                                                    : 'なし'}
                                            </td>
                                        </tr>
                                    );
                                }
                            )}
                            {props.npcuser && props.npcuser.roll && (
                                <tr>
                                    <td>{props.npcuser.userName}</td>
                                    <td>{props.npcuser.roll.name}</td>
                                    <td>{props.npcuser.roll.votingCount}</td>
                                    <td>なし</td>
                                    <td>なし</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
