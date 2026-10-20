/** Tiny flag parser: value flags need a value that is not another flag; unknown flags are errors. */
export function parseArgs(argv, { values = [], booleans = [] }) {
    const out = {};
    for (const b of booleans) out[b] = false;
    for (const v of values) out[v] = null;
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (!a.startsWith('--')) throw new Error(`不明な引数: ${a}`);
        const name = a.slice(2);
        if (booleans.includes(name)) { out[name] = true; continue; }
        if (!values.includes(name)) throw new Error(`不明なフラグ: ${a}`);
        const val = argv[i + 1];
        if (val === undefined || val.startsWith('--')) throw new Error(`${a} には値が必要です`);
        out[name] = val;
        i++;
    }
    return out;
}
