import Router from 'next/router';
import { RoomUserInfo } from '../../../type';
import styles from '../../../styles/components/timebomb/room.module.scss';

type Props = {
    turn: number;
    playerName: string;
    roomId: string;
    start: (msg: RoomUserInfo) => void;
};

export default function GameButtons({
    turn,
    playerName,
    roomId,
    start,
}: Props) {
    return (
        <>
            <div className={styles.btnarea}>
                <button
                    onClick={() => {
                        Router.push('/');
                    }}
                >
                    HOME
                </button>
                <button
                    onClick={() => {
                        start({
                            action: 'start',
                            roomId: roomId,
                            userName: playerName,
                            cardIndex: 0,
                            winTeam: 0,
                        });
                    }}
                >
                    {turn > 0 ? 'GAME RESET' : 'GAME START'}
                </button>
            </div>
            <div className={styles.rulebtn}>
                <button
                    onClick={() =>
                        window.open(
                            'https://www.youtube.com/watch?v=CCMmdl-O52k'
                        )
                    }
                >
                    RULE official
                </button>
            </div>
        </>
    );
}
