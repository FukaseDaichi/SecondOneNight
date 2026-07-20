// werewolf 月相タイマーの純ロジック。副作用なし。
// 色は docs/design.md 2.2 陣営カラーに準拠(村=ティール soft、人狼=ローズ)。
export const TIMER_TEAL = '#7fd0d6';
export const TIMER_ROSE = '#f0949b';

function clamp(v: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, v));
}

function hexToRgb(hex: string): [number, number, number] {
    const h = hex.replace('#', '');
    return [
        parseInt(h.slice(0, 2), 16),
        parseInt(h.slice(2, 4), 16),
        parseInt(h.slice(4, 6), 16),
    ];
}

// 残り秒を m:ss へ。負値は 0:00。小数は切り上げ(表示上の残り)。
export function formatTime(seconds: number): string {
    const s = Math.max(0, Math.ceil(seconds));
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
}

// 満月からの残量割合 p(0〜1)。月の欠けに使う。total<=0 は 0。
export function phaseProgress(rem: number, total: number): number {
    if (total <= 0) return 0;
    return clamp(rem / total, 0, 1);
}

// 色補間係数 t(0〜1)。残り60秒で 0、10秒で 1。範囲外はクランプ。
export function warmth(rem: number): number {
    return clamp((60 - rem) / 50, 0, 1);
}

// #rrggbb 2色を t で線形補間し rgb(r, g, b) を返す。
export function lerpColor(from: string, to: string, t: number): string {
    const a = hexToRgb(from);
    const b = hexToRgb(to);
    const k = clamp(t, 0, 1);
    const mix = (i: number) => Math.round(a[i] + (b[i] - a[i]) * k);
    return `rgb(${mix(0)}, ${mix(1)}, ${mix(2)})`;
}
