export const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];
export const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
export const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
export const UPLOAD_ENDPOINT = 'https://www.googleapis.com/upload/youtube/v3/videos';
export const THUMB_ENDPOINT = 'https://www.googleapis.com/upload/youtube/v3/thumbnails/set';
const PRIVACY = new Set(['private', 'unlisted', 'public']);

/** Error strings; empty means valid. Limits are YouTube's: title 100 chars (no < >), description 5000, tags 500 chars total. */
export function validateMeta(meta) {
    const errors = [];
    if (!meta || typeof meta !== 'object') return ['meta はオブジェクトではありません'];
    const title = meta.title;
    if (typeof title !== 'string' || !title.trim()) errors.push('title が空です');
    else {
        if ([...title].length > 100) errors.push(`title は 100 文字以内です(現在 ${[...title].length} 文字)`);
        if (/[<>]/.test(title)) errors.push('title に < > は使えません');
    }
    const desc = Array.isArray(meta.description) ? meta.description.join('\n') : meta.description;
    if (typeof desc !== 'string') errors.push('description は文字列か行の配列が必要です');
    else if ([...desc].length > 5000) errors.push(`description は 5000 文字以内です(現在 ${[...desc].length} 文字)`);
    if (!Array.isArray(meta.tags) || meta.tags.some((t) => typeof t !== 'string' || !t)) errors.push('tags は文字列の配列が必要です');
    else {
        const total = meta.tags.reduce((n, t) => n + [...t].length + (/\s/.test(t) ? 2 : 0), 0);
        if (total > 500) errors.push(`tags は合計 500 文字以内です(現在 ${total} 文字)`);
    }
    if (typeof meta.categoryId !== 'string' || !/^\d+$/.test(meta.categoryId)) errors.push('categoryId は数字の文字列が必要です(例 "20" = ゲーム)');
    if (!PRIVACY.has(meta.privacyStatus)) errors.push('privacyStatus は private / unlisted / public のいずれかです');
    if (meta.publishAt !== undefined && Number.isNaN(Date.parse(meta.publishAt))) errors.push('publishAt は ISO 8601 の日時が必要です');
    return errors;
}

export function buildVideoResource(meta) {
    const description = Array.isArray(meta.description) ? meta.description.join('\n') : meta.description;
    const status = { privacyStatus: meta.privacyStatus, selfDeclaredMadeForKids: false };
    if (meta.publishAt) status.publishAt = meta.publishAt;
    return {
        snippet: {
            title: meta.title,
            description,
            tags: meta.tags,
            categoryId: meta.categoryId,
            defaultLanguage: meta.language,
            defaultAudioLanguage: meta.language,
        },
        status,
    };
}

export function authUrl({ clientId, redirectUri, state }) {
    const u = new URL(AUTH_ENDPOINT);
    u.searchParams.set('client_id', clientId);
    u.searchParams.set('redirect_uri', redirectUri);
    u.searchParams.set('response_type', 'code');
    u.searchParams.set('access_type', 'offline');
    u.searchParams.set('prompt', 'consent');
    u.searchParams.set('scope', SCOPES.join(' '));
    u.searchParams.set('state', state);
    return u.toString();
}

export function videoUrl(id) {
    return 'https://www.youtube.com/watch?v=' + id;
}
