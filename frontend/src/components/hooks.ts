/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable prefer-const */
import { useRef, useEffect, useState, CSSProperties } from 'react';
import interact from 'interactjs';

type Partial<T> = {
    [P in keyof T]?: T[P];
};

const initPosition = {
    width: 100,
    height: 100,
    x: 0,
    y: 0,
};

/**
 * HTML要素を動かせるようにする
 * 返り値で所得できるrefと、styleをそれぞれ対象となるHTML要素の
 * refとstyleに指定することで、そのHTML要素のリサイズと移動が可能になる
 * @param position HTML要素の初期座標と大きさ、指定されない場合はinitPositionで指定された値になる
 */
export function useInteractJS(
    position: Partial<typeof initPosition> = initPosition
) {
    // 引数で指定したpositionを初期値として、Stateを作る
    const [_position, setPosition] = useState({
        ...initPosition,
        ...position,
    });

    const interactRef = useRef(null);
    let { x, y, width, height } = _position;

    const enable = () => {
        interact(interactRef.current as unknown as HTMLElement)
            // ドラッグでコンポーネントを動かすための処理を追加
            .draggable({
                inertia: false,
            })
            .on('dragmove', (event) => {
                x += event.dx;
                y += event.dy;
                // ドラッグ後の座標をstateに保存する
                setPosition({
                    width,
                    height,
                    x,
                    y,
                });
            });
    };

    const disable = () => {
        interact(interactRef.current as unknown as HTMLElement).unset();
    };

    useEffect(() => {
        enable();
        return disable;
    }, []);

    return {
        ref: interactRef,
        // 返り値にCSSのスタイルを追加する。このスタイルを動かしたいコンポーネントに適用することで、コンポーネントが実際に動くようになる
        style: {
            transform: `translate3D(${_position.x}px, ${_position.y}px, 0)`,
            position: 'absolute' as CSSProperties['position'],
        },
    };
}
