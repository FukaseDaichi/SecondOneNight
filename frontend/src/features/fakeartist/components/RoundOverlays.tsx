import React from 'react';
import styles from '../../../styles/components/fakeartist/room.module.scss';
import Start from '../../../components/common/Start';
import Modal from '../../../components/modal';

type Props = {
    startFlg: boolean;
    disscuttionStartFlg: boolean;
    votingStartFlg: boolean;
    endFlg: boolean;
    endMessage: string;
};

export default function RoundOverlays({
    startFlg,
    disscuttionStartFlg,
    votingStartFlg,
    endFlg,
    endMessage,
}: Props) {
    return (
        <>
            {/* 開始合図 */}
            {startFlg && <Start />}

            {/* 議論開始合図 */}
            {disscuttionStartFlg && (
                <Modal type="one">
                    <div className={styles.roundMessage}>議論開始</div>
                </Modal>
            )}

            {/* 投票開始合図 */}
            {votingStartFlg && (
                <Modal type="one">
                    <div className={styles.roundMessage}>投票開始！</div>
                </Modal>
            )}

            {/* 最後のメッセージ */}
            {endFlg && (
                <Modal type="two">
                    <div className={styles.roundEndMessage}>{endMessage}</div>
                </Modal>
            )}
        </>
    );
}
