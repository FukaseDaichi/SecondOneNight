import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

export const SCENE_ORDER = ['hook', 'title', 'pick', 'secret', 'public', 'vote', 'cta'];
const ID_RE = /^[a-z][a-z0-9-]{0,30}$/;

export async function loadScript(filePath) {
    return JSON.parse(await readFile(filePath, 'utf8'));
}

/** Returns an array of error strings; empty means valid. */
export function validateScript(script) {
    const errors = [];
    if (!script || typeof script !== 'object') return ['script はオブジェクトではありません'];
    if (typeof script.style !== 'string' || !script.style.trim()) errors.push('style が空です');
    if (!Array.isArray(script.scenes)) return [...errors, 'scenes が配列ではありません'];
    if (script.scenes.length !== 7) errors.push(`scenes は 7 件必要です(現在 ${script.scenes.length} 件)`);

    const seen = new Set();
    script.scenes.forEach((scene, i) => {
        const label = scene?.id ?? `#${i}`;
        if (typeof scene?.id !== 'string' || !ID_RE.test(scene.id)) {
            errors.push(`id が不正です: "${label}"(^[a-z][a-z0-9-]{0,30}$)`);
        }
        if (seen.has(scene?.id)) errors.push(`id が重複しています: "${label}"`);
        seen.add(scene?.id);
        if (typeof scene?.narration !== 'string' || !scene.narration.trim()) {
            errors.push(`${label}: narration が空です`);
        }
        if (typeof scene?.name !== 'string' || !scene.name) errors.push(`${label}: name が空です`);
        if (typeof scene?.narrationOffset !== 'number' || scene.narrationOffset < 0) {
            errors.push(`${label}: narrationOffset は 0 以上の数値が必要です`);
        }
        if (typeof scene?.tailPad !== 'number' || scene.tailPad < 0) {
            errors.push(`${label}: tailPad は 0 以上の数値が必要です`);
        }
        if (!Array.isArray(scene?.subtitles) || scene.subtitles.length === 0) {
            errors.push(`${label}: subtitles が空です`);
        } else {
            scene.subtitles.forEach((s, j) => {
                if (typeof s?.text !== 'string' || !s.text) errors.push(`${label}: subtitles[${j}].text が空です`);
                if (typeof s?.at !== 'number' || s.at < 0) errors.push(`${label}: subtitles[${j}].at は 0 以上の数値が必要です`);
            });
        }
    });

    const ids = script.scenes.map((s) => s?.id);
    if (ids.length === SCENE_ORDER.length && ids.some((id, i) => id !== SCENE_ORDER[i])) {
        errors.push(`scenes の順序が仕様と異なります(期待: ${SCENE_ORDER.join(', ')})`);
    }
    return errors;
}

/** Split narration on 。 and apportion start times by character length. */
export function estimateSubtitleTimes(narration, durationSec) {
    const parts = narration
        .split(/(?<=。)/)
        .map((s) => s.trim())
        .filter(Boolean);
    const total = parts.reduce((n, p) => n + p.length, 0) || 1;
    let elapsed = 0;
    return parts.map((text) => {
        const at = Math.round((elapsed / total) * durationSec * 100) / 100;
        elapsed += text.length;
        return { text, at };
    });
}

/** 16-hex digest of what determines a narration WAV: text, voice and style. */
export function narrationHash(scene, voice, style) {
    return createHash('sha1').update([scene.narration, voice ?? '', style ?? ''].join('\u0000')).digest('hex').slice(0, 16);
}

/** Every string the film shows from the script, plus extra UI strings, one per line (input for font subsetting). */
export function collectFontStrings(script, extra = '') {
    const lines = [];
    for (const sc of script.scenes) {
        lines.push(sc.name, sc.narration, sc.emphasis ?? '');
        for (const sub of sc.subtitles ?? []) lines.push(sub.text);
    }
    return [...lines, extra].filter(Boolean).join('\n');
}
