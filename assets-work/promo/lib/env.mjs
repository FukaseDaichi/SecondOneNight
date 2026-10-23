import { readFile } from 'node:fs/promises';

/** Minimal .env reader: KEY=value lines only; '#' lines and blanks ignored; quotes stripped. */
export async function loadEnv(filePath) {
    let text;
    try {
        text = await readFile(filePath, 'utf8');
    } catch (err) {
        if (err && err.code === 'ENOENT') return {};
        throw err;
    }
    const env = {};
    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const eq = line.indexOf('=');
        if (eq === -1) continue;
        const key = line.slice(0, eq).trim();
        let value = line.slice(eq + 1).trim();
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }
        if (key) env[key] = value;
    }
    return env;
}
