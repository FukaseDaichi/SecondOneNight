import { SystemConst } from '../../../const/next.config';
import UserInfo from './userInfo';
import styles from '../../../styles/components/werewolf/room.module.scss';
import { WerewolfRoll, WerewolfUser } from '../../../type/werewolf';

type Props = {
    playerData: WerewolfUser;
    playerName: string | null;
    userList: Array<WerewolfUser>;
    npcuser: WerewolfUser | null;
    turn: number;
    changeIcon: (url: string) => void;
    userAction: (targetUsername: string) => void;
    setModalRoll: (roll: WerewolfRoll | null) => void;
    playerActionName: string | null;
    playerNPCActionName: string | null;
    winteamList: Array<number>;
    setModalOwnFlg: (value: boolean) => void;
    removeUser: (userName: string) => void;
};

export default function UserField({
    playerData,
    playerName,
    userList,
    npcuser,
    turn,
    changeIcon,
    userAction,
    setModalRoll,
    playerActionName,
    playerNPCActionName,
    winteamList,
    setModalOwnFlg,
    removeUser,
}: Props) {
    return (
        <div className={styles.userfirld}>
            {userList.map((user, index: number) => {
                return (
                    <UserInfo
                        playerData={playerData}
                        key={index}
                        user={user}
                        ownFlg={user.userName === playerName}
                        userColor={SystemConst.PLAYER_COLOR_LIST[index]}
                        changeIcon={changeIcon}
                        turn={turn}
                        userAction={userAction}
                        setModalRoll={setModalRoll}
                        playerActionName={playerActionName}
                        winteamList={winteamList}
                        setModalOwnFlg={setModalOwnFlg}
                        removeUser={removeUser}
                    />
                );
            })}
            {npcuser && (
                <UserInfo
                    playerData={playerData}
                    user={npcuser}
                    ownFlg={false}
                    userColor={
                        SystemConst.PLAYER_COLOR_LIST[npcuser.userNo + 1]
                    }
                    changeIcon={changeIcon}
                    turn={turn}
                    userAction={userAction}
                    setModalRoll={setModalRoll}
                    playerActionName={playerNPCActionName}
                    winteamList={winteamList}
                    setModalOwnFlg={setModalOwnFlg}
                />
            )}
        </div>
    );
}
