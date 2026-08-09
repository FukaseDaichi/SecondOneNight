import WerewolfStart from './WerewolfStart';
import VotingStart from './VotingStart';
import CutIn from './cutin';
import ModalRollCard from './modalrollcard';
import RollSelectTurn from './rollselectturn';
import Rule from './rule';
import { WerewolfRoll, WerewolfUser } from '../../../type/werewolf';

type Props = {
    startFlg: boolean;
    votingStartFlg: boolean;
    cutInNo: number;
    turn: number;
    userList: Array<WerewolfUser>;
    modalRoll: WerewolfRoll | null;
    setModalRoll: (roll: WerewolfRoll | null) => void;
    modalOwnFlg: boolean;
    rollSelectTurnFlg: boolean;
    playerData: WerewolfUser | null;
    selectRoll: (rollIndex: number) => void;
    rollList: Array<WerewolfRoll>;
    setModalOwnFlg: (value: boolean) => void;
    ruleFlg: boolean;
    setRuleFlg: (value: boolean) => void;
};

export default function Overlays({
    startFlg,
    votingStartFlg,
    cutInNo,
    turn,
    userList,
    modalRoll,
    setModalRoll,
    modalOwnFlg,
    rollSelectTurnFlg,
    playerData,
    selectRoll,
    rollList,
    setModalOwnFlg,
    ruleFlg,
    setRuleFlg,
}: Props) {
    return (
        <>
            {/* 開始合図 */}
            {startFlg && <WerewolfStart />}
            {/* 投票時間 */}
            {votingStartFlg && <VotingStart />}
            {/* カットイン */}
            {cutInNo > 0 && <CutIn rollNo={cutInNo} />}

            {modalRoll && (
                <ModalRollCard
                    roll={modalRoll}
                    hidden={() => {
                        setTimeout(() => {
                            setModalRoll(null);
                        }, 450);
                    }}
                    turn={turn}
                    ownFlg={modalOwnFlg}
                />
            )}

            {!startFlg && rollSelectTurnFlg && playerData && (
                <RollSelectTurn
                    turn={turn}
                    user={playerData}
                    setModalRoll={setModalRoll}
                    selectRoll={selectRoll}
                    roll={playerData.roll}
                    userList={userList}
                    rollList={rollList}
                    setModalOwnFlg={setModalOwnFlg}
                    onShowRule={() => setRuleFlg(true)}
                />
            )}
            {ruleFlg && <Rule endFnc={() => setRuleFlg(false)} />}
        </>
    );
}
