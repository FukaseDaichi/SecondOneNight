import React, { useEffect } from 'react';
import styles from '../../styles/components/fakeartist/canvas.module.scss';
import { useState } from 'react';
import { TwitterPicker } from 'react-color';
import { ArtData, ArtDataStroke, FakeArtistUser } from '../../type/fakeartist';

// ポジション
const lastPosition = { x: null, y: null };

type CanvasProps = {
    drawFnc: (artDataStroke: ArtDataStroke) => void;
    playerData: FakeArtistUser;
    gameTime: number;
    personCanpasZindex: number;
    theme: string;
};

const Canvas = (props: CanvasProps): JSX.Element => {
    const [isDrag, setIsDrag] = useState(false);
    const [color, setColor] = useState('#010101');
    const [lineWidth, setLineWidth] = useState<number>(3);
    const [artDataArray, setArtDataArray] = useState<Array<ArtData>>([]);

    useEffect(() => {
        if (artDataArray.length > 100) {
            const stroke: ArtDataStroke = {
                name: props.playerData.userName,
                artDataList: artDataArray,
                color: color,
                lineWidth: lineWidth,
                endFlg: false,
            };
            props.drawFnc(stroke);
            setArtDataArray([]);
        }
    }, [artDataArray.length]);

    // マウスのドラッグを開始したらisDragのフラグをtrueにしてdraw関数内で
    const dragStart = () => {
        // 状態チェック
        if (!props.playerData.drawFlg) {
            return;
        }
        const canvas: HTMLCanvasElement = document.querySelector('#draw-area');
        const context = canvas.getContext('2d');

        // これから新しい線を書き始めることを宣言する
        // 一連の線を書く処理が終了したらdragEnd関数内のclosePathで終了を宣言する
        context.beginPath();
        setIsDrag(true);
    };

    // 絵を書く
    const draw = (x: number, y: number) => {
        const canvas: HTMLCanvasElement = document.querySelector('#draw-area');
        const context = canvas.getContext('2d');

        // マウスがドラッグされていなかったら処理を中断する。
        // ドラッグしながらしか絵を書くことが出来ない。
        if (!isDrag) {
            return;
        }
        // 「context.beginPath()」と「context.closePath()」を都度draw関数内で実行するよりも、
        // 線の描き始め(dragStart関数)と線の描き終わり(dragEnd)で1回ずつ読んだほうがより綺麗に線画書ける
        // 線の状態を定義する
        // MDN CanvasRenderingContext2D: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin
        context.lineCap = 'round'; // 丸みを帯びた線にする
        context.lineJoin = 'round'; // 丸みを帯びた線にする
        context.lineWidth = lineWidth; // 線の太さ
        context.strokeStyle = color; // 線の色

        // 書き始めは lastPosition.x, lastPosition.y の値はnullとなっているため、
        // クリックしたところを開始点としている。
        // この関数(draw関数内)の最後の2行で lastPosition.xとlastPosition.yに
        // 現在のx, y座標を記録することで、次にマウスを動かした時に、
        // 前回の位置から現在のマウスの位置まで線を引くようになる。
        if (lastPosition.x === null || lastPosition.y === null) {
            // ドラッグ開始時の線の開始位置
            context.moveTo(x, y);
        } else {
            // ドラッグ中の線の開始位置
            context.moveTo(lastPosition.x, lastPosition.y);
        }
        // context.moveToで設定した位置から、context.lineToで設定した位置までの線を引く。
        // - 開始時はmoveToとlineToの値が同じであるためただの点となる。
        // - ドラッグ中はlastPosition変数で前回のマウス位置を記録しているため、
        //   前回の位置から現在の位置までの線(点のつながり)となる
        context.lineTo(x, y);

        // context.moveTo, context.lineToの値を元に実際に線を引く
        context.stroke();

        // 現在のマウス位置を記録して、次回線を書くときの開始点に使う
        lastPosition.x = x;
        lastPosition.y = y;

        // お絵描き展開
        const artData: ArtData = {
            xparamPotision: Math.floor(x),
            yparamPotision: Math.floor(y),
        };
        setArtDataArray([...artDataArray, artData]);
    };

    // マウスのドラッグが終了したら、もしくはマウスがcanvas外に移動したら
    // isDragのフラグをfalseにしてdraw関数内でお絵かき処理が中断されるようにする
    const dragEnd = () => {
        // 状態チェック
        if (!props.playerData.drawFlg) {
            return;
        }
        const canvas: HTMLCanvasElement = document.querySelector('#draw-area');
        const context = canvas.getContext('2d');
        // 線を書く処理の終了を宣言する
        context.closePath();

        if (isDrag) {
            const stroke: ArtDataStroke = {
                name: props.playerData.userName,
                artDataList: artDataArray,
                color: color,
                lineWidth: lineWidth,
                endFlg: true,
            };
            props.drawFnc(stroke);
            setArtDataArray([]);
        }
        setIsDrag(false);
        // 描画中に記録していた値をリセットする
        lastPosition.x = null;
        lastPosition.y = null;
    };

    const mousemove = (event) => {
        // 状態チェック
        if (!props.playerData.drawFlg) {
            return;
        }

        draw(event.nativeEvent.layerX, event.nativeEvent.layerY);
    };

    const touchmove = (event) => {
        // 状態チェック
        if (!props.playerData.drawFlg) {
            return;
        }

        const target = event.touches[0];
        const canvas: HTMLCanvasElement = document.querySelector('#draw-area');
        const x =
            target.pageX - canvas.getBoundingClientRect().left - window.scrollX;
        const y =
            target.pageY - canvas.getBoundingClientRect().top - window.scrollY;
        draw(x, y);
    };

    const colorChange = (color) => {
        setColor(color.hex);
    };

    const lineWidthChange = (event) => {
        setLineWidth(Number(event.target.value));
    };

    useEffect(() => {
        function handleSubmit(e) {
            e.preventDefault();
        }
        const canvas: HTMLCanvasElement = document.querySelector('#draw-area');
        canvas.addEventListener('touchmove', handleSubmit, {
            passive: false,
        });
    }, []);

    const themeFlg = props.gameTime > 1 && props.playerData.rollNo === 1;
    return (
        <div className={styles.canvasmain}>
            <canvas
                id="draw-area"
                width="343px"
                height="343px"
                onMouseDown={dragStart}
                onMouseUp={dragEnd}
                onMouseOut={dragEnd}
                onMouseMove={mousemove}
                // スマートフォン用
                onTouchStart={dragStart}
                onTouchEnd={dragEnd}
                onTouchMove={touchmove}
            ></canvas>
            {/* お絵描き中のマスク */}
            {props.gameTime === 1 && !props.playerData.drawFlg && (
                <div className={styles.protected}></div>
            )}

            {/* 第二キャンパス */}
            {props.gameTime === 2 && (
                <canvas
                    id="person-draw-area"
                    className={styles.person}
                    width="343px"
                    height="343px"
                    style={{ zIndex: props.personCanpasZindex }}
                ></canvas>
            )}
            {/* テーマ */}
            {themeFlg && (
                <div className={styles.theme}>
                    テーマ<span>「{props.theme}」</span>
                </div>
            )}
            <TwitterPicker
                color={color}
                onChange={colorChange}
                colors={[
                    '#FFFFFF',
                    '#ABB8C3',
                    '#010101',
                    '#FF6900',
                    '#AE5800',
                    '#FCB900',
                    '#7BDCB5',
                    '#00D084',
                    '#8ED1FC',
                    '#0693E3',
                    '#EB144C',
                    '#F78DA7',
                    '#9900EF',
                    '#FFF42F',
                ]}
            />
            <div className={styles.lineWidth}>
                <input
                    type="range"
                    name="range"
                    min="1"
                    max="12"
                    value={lineWidth}
                    onChange={lineWidthChange}
                />
                <h3>{lineWidth}</h3>
            </div>
        </div>
    );
};
export default Canvas;
