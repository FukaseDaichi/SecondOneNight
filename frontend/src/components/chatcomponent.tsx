/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import styles from '../styles/components/chatcomponent.module.scss';
import { useState } from 'react';
import { useInteractJS } from './hooks';

const getIconImgUrl = (userNo: number, userIconUrl: string) => {
    if (userIconUrl) {
        return userIconUrl;
    }
    return '/images/icon/icon' + String(userNo) + '.jpg';
};

type ChatComponentProps = {
    chatList: Array<any>;
    chat: (message: string) => void;
};

export default function ChatComponent(props: ChatComponentProps): JSX.Element {
    // メッセージ送信
    const sendMessage = () => {
        const messageDom = document.getElementById(
            'chat-message'
        ) as HTMLInputElement;
        if (messageDom.value === '') {
            return false;
        }
        props.chat(messageDom.value);
        messageDom.value = '';
    };

    const interact: any = useInteractJS();
    const [closeFlg, setCloseflg] = useState(false);

    const changeClose = () => {
        setCloseflg(!closeFlg);
    };

    return (
        <div
            className={`${styles['chat-area']} ${
                closeFlg ? styles.closed : ''
            }`}
            draggable="true"
            ref={interact.ref}
            style={{
                ...interact.style,
                height: closeFlg ? '30px' : '400px',
                width: closeFlg ? '130px' : '300px',
            }}
        >
            <div className={styles['chat-header']}>
                CHAT
                <span onClick={changeClose}></span>
            </div>
            <div className={styles['chat-firld']} id="chat-firld">
                {props.chatList.map((chatEntity, index: number) => {
                    return (
                        <div className={styles.chat} key={index}>
                            <div className={styles['icon-area']}>
                                <div className={styles.icon}>
                                    <img
                                        src={getIconImgUrl(
                                            chatEntity.user.userNo,
                                            chatEntity.user.userIconUrl
                                        )}
                                        alt="iconImg"
                                    />
                                </div>
                                <div className={styles.name}>
                                    {chatEntity.user.userName}
                                </div>
                            </div>
                            <div className={styles.message}>
                                {chatEntity.message}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className={styles['chat-input']}>
                <input
                    type="text"
                    placeholder="MESSAGE"
                    maxLength={100}
                    id="chat-message"
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            sendMessage();
                        }
                    }}
                />
                <button onClick={sendMessage}>send</button>
            </div>
        </div>
    );
}
