/** ffmpeg argv: video + per-scene narration WAVs → narration placed by narrationStart, mixed over the film audio. */
export function buildMuxArgs({ video, scenes, narrationDir, out, bgmVolume = 0.4, videoHasAudio = true }) {
    const args = ['-y', '-i', video];
    for (const s of scenes) args.push('-i', `${narrationDir}/narration-${s.id}.wav`);

    const delayed = scenes.map((s, i) => {
        const ms = Math.round(s.narrationStart * 1000);
        return `[${i + 1}:a]adelay=${ms}|${ms}[n${i}]`;
    });
    const narrLabels = scenes.map((_, i) => `[n${i}]`).join('');
    const parts = [...delayed, `${narrLabels}amix=inputs=${scenes.length}:normalize=0[nmix]`];
    const loud = 'loudnorm=I=-16:TP=-1.5:LRA=11';
    if (videoHasAudio) {
        parts.push(`[nmix]${loud}[narr]`);
        parts.push(`[0:a]volume=${bgmVolume}[bgm]`);
        parts.push(`[bgm][narr]amix=inputs=2:duration=first:normalize=0[aout]`);
    } else {
        parts.push(`[nmix]${loud}[aout]`);
    }

    args.push('-filter_complex', parts.join(';'));
    args.push('-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out);
    return args;
}

/** null when the last narration ends within the video; otherwise a message naming the overflow and scene. */
export function checkNarrationFits(scenes, videoDuration) {
    let worst = null;
    for (const s of scenes) {
        const end = s.narrationStart + s.narrationDur;
        if (end > videoDuration && (!worst || end > worst.end)) worst = { id: s.id, end };
    }
    if (!worst) return null;
    const over = (worst.end - videoDuration).toFixed(1);
    return `ナレーションが映像より ${over} 秒長い(シーン ${worst.id})。Motion 側の尺を timeline.json に合わせて再 Export してください`;
}
