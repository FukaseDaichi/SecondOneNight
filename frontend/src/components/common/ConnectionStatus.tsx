import styles from '../../styles/components/common/connectionstatus.module.scss';
import type { ConnectionStatus as Status } from '../../lib/stomp/types';

export default function ConnectionStatus({ status }: { status: Status }) {
    if (status !== 'reconnecting' && status !== 'disconnected') {
        return null;
    }
    return (
        <div className={styles.banner} role="status">
            {status === 'reconnecting' ? '再接続中…' : '接続が切れました'}
        </div>
    );
}
