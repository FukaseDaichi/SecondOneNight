import React from 'react';
import styles from '../../styles/components/message/chatmessage.module.scss';

// 5ゲーム共用。'error' のときだけ赤系・表示時間を延長する
// (他4ゲームは常に 'info' を渡すため見た目は従来どおり)
type ChatMessageProps = {
    value: string;
    type: 'info' | 'error';
};

export default function ChatMessage(props: ChatMessageProps) {
    const isError = props.type === 'error';
    return (
        <div
            className={`${styles.chatmessage} ${isError ? styles.error : ''}`}
            role="status"
            aria-live="polite"
        >
            <div className="container">
                <div className={`${styles.message} ${styles.new}`}>
                    <span className={styles.title}>
                        {isError ? 'ERROR' : 'INFO'}
                    </span>
                    <p>{props.value}</p>
                </div>
            </div>
        </div>
    );
}
