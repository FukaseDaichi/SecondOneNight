import { ArtDataStroke } from '../../type/fakeartist';

// お絵描きコールバック
export const callBackDraw = (artDataStroke: ArtDataStroke) => {
    const canvas: HTMLCanvasElement = document.querySelector('#draw-area');
    if (!canvas) {
        return;
    }
    const context = canvas.getContext('2d');

    context.beginPath();

    for (let i = 0; i < artDataStroke.artDataList.length - 1; i++) {
        context.lineCap = 'round'; // 丸みを帯びた線にする
        context.lineJoin = 'round'; // 丸みを帯びた線にする
        context.lineWidth = artDataStroke.lineWidth; // 線の太さ
        context.strokeStyle = artDataStroke.color; // 線の色

        context.moveTo(
            artDataStroke.artDataList[i].xparamPotision,
            artDataStroke.artDataList[i].yparamPotision
        );
        context.lineTo(
            artDataStroke.artDataList[i + 1].xparamPotision,
            artDataStroke.artDataList[i + 1].yparamPotision
        );
        context.stroke();
    }

    context.closePath();
};

// canvas上に書いた絵を全部消す
export const clear = () => {
    const canvas: HTMLCanvasElement = document.querySelector('#draw-area');
    if (!canvas) {
        return;
    }
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const drawCanvas = (artDataStrokeArray: Array<any>) => {
    artDataStrokeArray.forEach((obj) => {
        callBackDraw(obj);
    });
};

// セカンドキャンパスの描画
export const drawPersonCanvas = (
    artDataStrokeArray: Array<ArtDataStroke>,
    userName: string
) => {
    const canvas: HTMLCanvasElement =
        document.querySelector('#person-draw-area');
    if (!canvas) {
        return;
    }
    const context = canvas.getContext('2d');

    //既存削除
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (const artDataStroke of artDataStrokeArray) {
        if (artDataStroke.name === userName) {
            context.beginPath();
            for (let i = 0; i < artDataStroke.artDataList.length - 1; i++) {
                context.lineCap = 'round'; // 丸みを帯びた線にする
                context.lineJoin = 'round'; // 丸みを帯びた線にする
                context.lineWidth = artDataStroke.lineWidth; // 線の太さ
                context.strokeStyle = artDataStroke.color; // 線の色

                context.moveTo(
                    artDataStroke.artDataList[i].xparamPotision,
                    artDataStroke.artDataList[i].yparamPotision
                );
                context.lineTo(
                    artDataStroke.artDataList[i + 1].xparamPotision,
                    artDataStroke.artDataList[i + 1].yparamPotision
                );
                context.stroke();
            }
            context.closePath();
        }
    }
};
