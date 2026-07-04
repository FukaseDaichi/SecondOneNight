import type { ISourceOptions } from '@tsparticles/engine';

export type SakuraMode = 'ambient' | 'celebration';

// LP の LeafFall と同系のローズ/ティール(待機中のデフォルト)
export const DEFAULT_PALETTE = [
    '#E88F94',
    '#E9A7BE',
    '#F3B9BC',
    '#8FD0D6',
];

// 花びら形 SVG(3種)。fill は palette の色で焼き込む
const PETAL_PATHS = [
    // ふっくらした桜の花びら(先端に切れ込み)
    'M16 2 C21 6 25 11 25 17 C25 24 21 29 16 30 C11 29 7 24 7 17 C7 11 11 6 14 4 L16 8 Z',
    // 細長い花びら
    'M16 1 C20 7 23 13 22 20 C21 27 18 31 16 31 C14 31 11 27 10 20 C9 13 12 7 16 1 Z',
    // 丸みの強い花びら
    'M16 3 C23 5 27 12 26 19 C25 26 20 30 16 29 C12 30 7 26 6 19 C5 12 9 5 16 3 Z',
];

const petalDataUrl = (path: string, color: string): string =>
    `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="${path}" fill="${color}" fill-opacity="0.9"/></svg>`
    )}`;

// 粒子数: celebration は大量、ambient はまばら。スマホは減量
export const particleCount = (
    mode: SakuraMode,
    isMobile: boolean
): number => {
    if (mode === 'celebration') {
        return isMobile ? 35 : 60;
    }
    return isMobile ? 10 : 15;
};

export const buildSakuraOptions = (
    mode: SakuraMode,
    palette: string[],
    isMobile: boolean
): ISourceOptions => {
    const colors = palette.length > 0 ? palette : DEFAULT_PALETTE;
    const images = colors.flatMap((color) =>
        PETAL_PATHS.map((path) => ({
            src: petalDataUrl(path, color),
            width: 32,
            height: 32,
        }))
    );
    const celebration = mode === 'celebration';

    return {
        fullScreen: { enable: false },
        fpsLimit: 60,
        pauseOnBlur: true,
        detectRetina: true,
        particles: {
            number: {
                value: particleCount(mode, isMobile),
                density: { enable: false },
            },
            shape: {
                type: 'image',
                options: { image: images },
            },
            opacity: {
                value: celebration
                    ? { min: 0.6, max: 0.95 }
                    : { min: 0.4, max: 0.8 },
            },
            size: {
                value: celebration ? { min: 7, max: 14 } : { min: 6, max: 11 },
            },
            move: {
                enable: true,
                direction: 'bottom',
                speed: celebration ? { min: 2, max: 4.5 } : { min: 0.6, max: 1.4 },
                drift: celebration ? { min: -2, max: 2 } : { min: -1, max: 1 },
                straight: false,
                outModes: { default: 'out', top: 'out' },
            },
            rotate: {
                value: { min: 0, max: 360 },
                direction: 'random',
                animation: { enable: true, speed: celebration ? 24 : 9 },
            },
            wobble: {
                enable: true,
                distance: celebration ? 20 : 12,
                speed: {
                    angle: celebration ? 16 : 8,
                    move: celebration ? 10 : 6,
                },
            },
            tilt: {
                enable: true,
                value: { min: 0, max: 360 },
                direction: 'random',
                animation: { enable: true, speed: celebration ? 26 : 11 },
            },
        },
    };
};
