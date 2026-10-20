#!/usr/bin/env node
// Upload the finished MP4 to YouTube with title / description / tags / thumbnail, as private.
//   node youtube-upload.mjs --auth                    # first time: browser consent, stores .youtube-token.json
//   node youtube-upload.mjs --dry-run                 # validate meta and print the request body, no network
//   node youtube-upload.mjs [--video out/x.mp4] [--meta youtube-meta.json] [--thumb path.jpg]
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateMeta, buildVideoResource, authUrl, videoUrl, TOKEN_ENDPOINT, UPLOAD_ENDPOINT, THUMB_ENDPOINT } from './lib/youtube.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (name, dflt) => { const i = args.indexOf(name); return i === -1 ? dflt : args[i + 1]; };
const has = (name) => args.includes(name);
const CLIENT_FILE = join(root, '.youtube-client.json');
const TOKEN_FILE = join(root, '.youtube-token.json');

function fail(msg) { console.error(`[youtube] ${msg}`); process.exit(1); }

async function readJson(file, what) {
    try { return JSON.parse(await readFile(file, 'utf8')); }
    catch (err) { if (err.code === 'ENOENT') fail(`${what} がありません: ${file}`); throw err; }
}

async function loadClient() {
    const raw = await readJson(CLIENT_FILE, 'OAuth クライアント JSON(Google Cloud からダウンロード)');
    const c = raw.installed || raw.web || raw;
    if (!c.client_id || !c.client_secret) fail('.youtube-client.json に client_id / client_secret がありません(種類「デスクトップアプリ」で作成してください)');
    return { clientId: c.client_id, clientSecret: c.client_secret };
}

async function tokenRequest(params) {
    const res = await fetch(TOKEN_ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(params) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) fail(`トークン取得に失敗: HTTP ${res.status} ${JSON.stringify(json).slice(0, 300)}`);
    return json;
}

async function authorize() {
    const { clientId, clientSecret } = await loadClient();
    const state = randomBytes(12).toString('hex');
    const code = await new Promise((resolve, reject) => {
        const server = createServer((req, res) => {
            const u = new URL(req.url, 'http://127.0.0.1');
            if (u.pathname !== '/cb') { res.statusCode = 404; res.end(); return; }
            if (u.searchParams.get('state') !== state) { res.statusCode = 400; res.end('state mismatch'); reject(new Error('state mismatch')); return; }
            res.setHeader('content-type', 'text/html; charset=utf-8');
            res.end('<p>認証できました。このタブは閉じて構いません。</p>');
            server.close();
            resolve(u.searchParams.get('code'));
        });
        server.listen(0, '127.0.0.1', () => {
            const redirectUri = `http://127.0.0.1:${server.address().port}/cb`;
            const url = authUrl({ clientId, redirectUri, state });
            server.redirectUri = redirectUri;
            console.log('[youtube] ブラウザで次の URL を開いて同意してください:\n' + url);
            spawn('open', [url], { stdio: 'ignore', detached: true }).on('error', () => {}).unref();
        });
        setTimeout(() => { server.close(); reject(new Error('同意待ちがタイムアウトしました(5 分)')); }, 5 * 60 * 1000).unref();
        authorize.redirectUriOf = () => server.redirectUri;
    });
    const token = await tokenRequest({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: authorize.redirectUriOf(), grant_type: 'authorization_code' });
    if (!token.refresh_token) fail('refresh_token が返りませんでした。Google アカウントの「サードパーティのアクセス」からこのアプリを削除して再実行してください');
    await writeFile(TOKEN_FILE, JSON.stringify({ refresh_token: token.refresh_token, obtained_at: new Date().toISOString() }, null, 2) + '\n', { mode: 0o600 });
    console.log(`[youtube] 認証情報を保存しました: ${TOKEN_FILE}`);
}

async function accessToken() {
    const { clientId, clientSecret } = await loadClient();
    const saved = await readJson(TOKEN_FILE, '認証トークン(先に --auth を実行)');
    const t = await tokenRequest({ refresh_token: saved.refresh_token, client_id: clientId, client_secret: clientSecret, grant_type: 'refresh_token' });
    return t.access_token;
}

async function uploadVideo(token, file, resource) {
    const size = (await stat(file)).size;
    const start = await fetch(`${UPLOAD_ENDPOINT}?uploadType=resumable&part=snippet,status`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json; charset=UTF-8', 'x-upload-content-type': 'video/mp4', 'x-upload-content-length': String(size) },
        body: JSON.stringify(resource),
    });
    if (!start.ok) fail(`アップロード開始に失敗: HTTP ${start.status} ${(await start.text()).slice(0, 400)}`);
    const location = start.headers.get('location');
    if (!location) fail('アップロード URL(Location ヘッダ)が返りませんでした');
    console.log(`[youtube] アップロード中 (${(size / 1024 / 1024).toFixed(1)} MiB)...`);
    const put = await fetch(location, { method: 'PUT', headers: { 'content-type': 'video/mp4', 'content-length': String(size) }, body: await readFile(file) });
    const json = await put.json().catch(() => ({}));
    if (!put.ok || !json.id) fail(`アップロードに失敗: HTTP ${put.status} ${JSON.stringify(json).slice(0, 400)}`);
    return json;
}

async function setThumbnail(token, videoId, file) {
    const ext = extname(file).toLowerCase();
    const type = ext === '.png' ? 'image/png' : 'image/jpeg';
    const res = await fetch(`${THUMB_ENDPOINT}?videoId=${encodeURIComponent(videoId)}&uploadType=media`, { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': type }, body: await readFile(file) });
    if (!res.ok) console.warn(`[youtube] サムネイル設定に失敗(動画は上がっています): HTTP ${res.status} ${(await res.text()).slice(0, 300)}`);
    else console.log('[youtube] サムネイルを設定しました');
}

const meta = await readJson(join(root, flag('--meta', 'youtube-meta.json')), 'メタデータ');
const errors = validateMeta(meta);
if (errors.length) fail(`youtube-meta.json が不正です:\n  ${errors.join('\n  ')}`);
const resource = buildVideoResource(meta);

if (has('--dry-run')) { console.log(JSON.stringify(resource, null, 2)); process.exit(0); }
if (has('--auth')) { await authorize(); process.exit(0); }

const video = join(root, flag('--video', 'out/werewolf-promo-9x16.mp4'));
await stat(video).catch(() => fail(`動画ファイルがありません: ${video}`));
const token = await accessToken();
const result = await uploadVideo(token, video, resource);
console.log(`[youtube] 完了: ${videoUrl(result.id)}  (status: ${result.status?.privacyStatus ?? meta.privacyStatus}; 未審査プロジェクトの場合は非公開ロックです。YouTube Studio から公開してください)`);
const thumb = flag('--thumb', null);
if (thumb) await setThumbnail(token, result.id, join(root, thumb));
