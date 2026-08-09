import React from 'react';
import styles from '../../styles/components/message/chatmessage.module.scss';

// 5ゲーム共用。'error' のときだけ赤系・表示時間を延長する
// (他4ゲームは常に 'info' を渡すため見た目は従来どおり)
type ChatMessageProps = {
    value: string;
    type: 'info' | 'error';
    // ページ側に常設のライブリージョンがある場合(werewolf)に true。
    // このトーストはメッセージと同時にマウントされるためライブリージョンとしては
    // 機能せず、読み上げは常設側に任せて二重読み上げを避ける
    srHidden?: boolean;
};

export default function ChatMessage(props: ChatMessageProps) {
    const isError = props.type === 'error';
    return (
        <div
            className={`${styles.chatmessage} ${isError ? styles.error : ''}`}
            aria-hidden={props.srHidden ? true : undefined}
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
