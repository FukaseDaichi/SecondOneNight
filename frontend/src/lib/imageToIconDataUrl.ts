const ICON_SIZE = 96;
export const MAX_DATA_URL_LENGTH = 40000; // base64 で約30KB。STOMP 64KB 制限に余裕を持たせる

export function assertIconDataUrlSize(dataUrl: string): string {
    if (dataUrl.length >= MAX_DATA_URL_LENGTH) {
        throw new Error(
            '画像を小さくできませんでした。別の画像をお試しください'
        );
    }
    return dataUrl;
}

/**
 * 画像ファイルを 96px 正方形(中央クロップ)の JPEG Data URL に変換する。
 * 部屋の生存中のみ有効なアイコンとして status 650 でそのまま送信できるサイズに抑える。
 */
export async function imageToIconDataUrl(file: File): Promise<string> {
    if (!file.type.startsWith('image/')) {
        throw new Error('画像ファイルを選択してください');
    }
    if (file.size > 10 * 1024 * 1024) {
        throw new Error('10MB以下の画像を選択してください');
    }

    const bitmap = await createImageBitmap(file).catch(() => {
        throw new Error('画像を読み込めませんでした');
    });

    const canvas = document.createElement('canvas');
    canvas.width = ICON_SIZE;
    canvas.height = ICON_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('画像を変換できませんでした');
    }

    const scale = Math.max(
        ICON_SIZE / bitmap.width,
        ICON_SIZE / bitmap.height
    );
    const w = bitmap.width * scale;
    const h = bitmap.height * scale;
    ctx.drawImage(bitmap, (ICON_SIZE - w) / 2, (ICON_SIZE - h) / 2, w, h);
    bitmap.close();

    for (const quality of [0.7, 0.5, 0.35]) {
        const url = canvas.toDataURL('image/jpeg', quality);
        if (url.length < MAX_DATA_URL_LENGTH) {
            return url;
        }
    }
    return assertIconDataUrlSize(canvas.toDataURL('image/jpeg', 0.35));
}
