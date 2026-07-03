import React, { SyntheticEvent } from 'react';
import styles from '../../styles/components/home/creategamebtn.module.scss';
import { useState } from 'react';
import { SystemConst } from '../../const/next.config';
import Router from 'next/router';

type CreateGameBtnProps = {
    title: string;
    discription: string;
    imgUrl: string;
    gameId: string;
};

const addCleckedStyle = (dom: HTMLElement) => {
    if (dom) {
        dom.classList.add(styles.clicked);
    }
};

export default function CreateGameBtn(props: CreateGameBtnProps): JSX.Element {
    const [createFlg, setCreateFlg] = useState(false);
    const [roomId, setRoomId] = useState('');

    const copyText = (event: SyntheticEvent) => {
        const target = event.target as HTMLElement;
        const roomUrlDom = document.querySelector('#' + props.gameId + '_url');
        document.getSelection().selectAllChildren(roomUrlDom);
        // 選択範囲のコピー
        document.execCommand('copy');
        // テキスト選択の解除
        document.getSelection().empty();

        addCleckedStyle(target);
        target.innerText = 'OK';
    };

    // ルーム作成
    const createRoombtn = async (game: string) => {
        if (createFlg) {
            return;
        }
        setCreateFlg(true);

        let url = SystemConst.Server.AP_HOST + SystemConst.Server.CREATE_ROOM;
        if (game !== 'timebomb') {
            url = url + '/' + game;
        }

        await fetch(url)
            .then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    throw new Error();
                }
            })
            .then((resJson) => {
                setRoomId(resJson.roomId);
                const roomUrlDom = document.querySelector(
                    '#' + props.gameId + '_url'
                ) as HTMLElement;
                roomUrlDom.innerText =
                    location.href + game + '/' + resJson.roomId;
                setCreateFlg(true);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    // ルーム入室
    const roomIn = (event: SyntheticEvent) => {
        const target = event.target as HTMLElement;
        addCleckedStyle(target);
        Router.push('/' + props.gameId + '/' + roomId);
    };

    return (
        <div
            className={styles.game}
            onClick={() => {
                createRoombtn(props.gameId);
            }}
        >
            <div className={styles.img}>
                <img src={props.imgUrl} alt="イメージ画像" />
            </div>
            <div className={styles.url} id={props.gameId + '_url'}></div>
            {!createFlg ? (
                <div className={styles.discription}>
                    <h1>{props.title}</h1>
                    <div>{props.discription}</div>
                </div>
            ) : (
                <div className={styles.discription}>
                    {roomId ? (
                        <div>
                            部屋の作成が完了しました。
                            <br />
                            参加者にURLを伝えて入室してください。
                            <div className={styles.btn}>
                                <div
                                    onClick={copyText}
                                    id={props.gameId + '_copy'}
                                >
                                    URLコピー
                                </div>
                                <div onClick={roomIn}>入室</div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.spinner}>
                            <div></div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
