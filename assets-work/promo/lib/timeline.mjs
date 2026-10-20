const r2 = (n) => Math.round(n * 100) / 100;

/** Chain scenes: dur = narrationOffset + narrationDur + tailPad; start accumulates. */
export function computeTimeline(script, durations) {
    let cursor = 0;
    const scenes = script.scenes.map((scene) => {
        const narrationDur = durations?.[scene.id];
        if (typeof narrationDur !== 'number') {
            throw new Error(`durations に "${scene.id}" の長さがありません(tts.mjs を先に実行してください)`);
        }
        const start = r2(cursor);
        const dur = r2(scene.narrationOffset + narrationDur + scene.tailPad);
        const out = {
            id: scene.id,
            name: scene.name,
            start,
            dur,
            narrationStart: r2(start + scene.narrationOffset),
            narrationDur: r2(narrationDur),
            subtitles: scene.subtitles,
        };
        cursor = start + dur;
        return out;
    });
    return { total: r2(cursor), scenes };
}

export function checkTotal(total, limit = 85) {
    if (total <= limit) return null;
    return `合計 ${total.toFixed(1)} 秒。${limit} 秒超のため台本を削ってください`;
}
