import WerewolfStart from './WerewolfStart';
import Modal from '../../../components/modal';
import CutIn from './cutin';
import CircleBtn from '../../../components/button/circlebtn';
import Result from './result';
import ModalRollCard from './modalrollcard';
import RollSelectTurn from './rollselectturn';
import Rule from './rule';
import styles from '../../../styles/components/werewolf/room.module.scss';
import { WerewolfRoll, WerewolfUser } from '../../../type/werewolf';

type Props = {
    startFlg: boolean;
    votingStartFlg: boolean;
    cutInNo: number;
    winMessage: string | null;
    turn: number;
    setResultFlg: (value: boolean) => void;
    resultFlg: boolean;
    userList: Array<WerewolfUser>;
    winteamList: Array<number>;
    npcuser: WerewolfUser | null;
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
    winMessage,
    turn,
    setResultFlg,
    resultFlg,
    userList,
    winteamList,
    npcuser,
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
            {votingStartFlg && (
                <Modal type="one">
                    <div className={styles.roundMessage}>投票時間</div>
                </Modal>
            )}
            {/* カットイン */}
            {cutInNo > 0 && <CutIn rollNo={cutInNo} />}
            {/* 勝利文字 */}
            {winMessage != null && turn === 4 && (
                <div className={styles.winmessage}>
                    <div className={styles.message}>
                        <span>{winMessage}</span>の勝利
                    </div>
                    <div className={styles.resultbtn}>
                        <CircleBtn
                            value="詳細"
                            size={50}
                            onClickFnc={() => setResultFlg(true)}
                        />
                    </div>
                </div>
            )}
            {/* 結果 */}
            {resultFlg && (
                <Result
                    endFnc={() => setResultFlg(false)}
                    userList={userList}
                    winteamList={winteamList}
                    npcuser={npcuser}
                />
            )}

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
                />
            )}
            <div className={styles.rulebtn}>
                <button onClick={() => setRuleFlg(true)}>遊び方</button>
                {ruleFlg && <Rule endFnc={() => setRuleFlg(false)} />}
            </div>
        </>
    );
}
