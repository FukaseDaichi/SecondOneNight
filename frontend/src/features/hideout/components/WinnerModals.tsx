import HideoutModal from '../../../components/modal/hideoutmodal';
import styles from '../../../styles/components/hideout/room.module.scss';

type Props = {
    rushAreaFlg: boolean;
    terroristWinFlg: boolean;
    swatWinFlg: boolean;
    dismissTerroristWin: () => void;
    dismissSwatWin: () => void;
};

export default function WinnerModals({
    rushAreaFlg,
    terroristWinFlg,
    swatWinFlg,
    dismissTerroristWin,
    dismissSwatWin,
}: Props) {
    return (
        <>
            {!rushAreaFlg && terroristWinFlg && (
                <HideoutModal
                    type={'seven'}
                    endFnc={() => {
                        setTimeout(() => {
                            dismissTerroristWin();
                        }, 3000);
                    }}
                >
                    <div className={styles.result}>
                        <img
                            src="/images/hideout/terroristwin.png"
                            alt="結果"
                        />
                    </div>
                </HideoutModal>
            )}
            {!rushAreaFlg && swatWinFlg && (
                <HideoutModal
                    type={'five'}
                    endFnc={() => {
                        setTimeout(() => {
                            dismissSwatWin();
                        }, 3000);
                    }}
                >
                    <div className={styles.result}>
                        <img src="/images/hideout/swatwin.png" alt="結果" />
                    </div>
                </HideoutModal>
            )}
        </>
    );
}
