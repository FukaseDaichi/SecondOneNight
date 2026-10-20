import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateMeta, buildVideoResource, authUrl, videoUrl, SCOPES } from '../lib/youtube.mjs';

const META = {
    title: 'テスト動画 #Shorts',
    description: ['1行目', '', '2行目 https://example.com'],
    tags: ['人狼', 'Shorts'],
    categoryId: '20',
    language: 'ja',
    privacyStatus: 'private',
};

test('validateMeta accepts a well-formed meta', () => {
    assert.deepEqual(validateMeta(META), []);
});

test('validateMeta rejects long or angle-bracketed titles', () => {
    assert.ok(validateMeta({ ...META, title: 'あ'.repeat(101) }).some((e) => /title/.test(e) && /100/.test(e)));
    assert.ok(validateMeta({ ...META, title: 'a<b>' }).some((e) => /title/.test(e) && /[<>]/.test(e)));
});

test('validateMeta rejects bad privacy, long description, long tags', () => {
    assert.ok(validateMeta({ ...META, privacyStatus: 'secret' }).some((e) => /privacyStatus/.test(e)));
    assert.ok(validateMeta({ ...META, description: ['x'.repeat(5001)] }).some((e) => /description/.test(e) && /5000/.test(e)));
    assert.ok(validateMeta({ ...META, tags: ['t'.repeat(501)] }).some((e) => /tags/.test(e) && /500/.test(e)));
    assert.ok(validateMeta({ ...META, categoryId: 20 }).some((e) => /categoryId/.test(e)));
});

test('buildVideoResource maps meta to the videos.insert body', () => {
    const r = buildVideoResource(META);
    assert.equal(r.snippet.title, 'テスト動画 #Shorts');
    assert.equal(r.snippet.description, '1行目\n\n2行目 https://example.com');
    assert.deepEqual(r.snippet.tags, ['人狼', 'Shorts']);
    assert.equal(r.snippet.categoryId, '20');
    assert.equal(r.snippet.defaultLanguage, 'ja');
    assert.equal(r.snippet.defaultAudioLanguage, 'ja');
    assert.deepEqual(r.status, { privacyStatus: 'private', selfDeclaredMadeForKids: false });
});

test('buildVideoResource adds publishAt only when scheduled', () => {
    const r = buildVideoResource({ ...META, publishAt: '2026-11-01T12:00:00+09:00' });
    assert.equal(r.status.publishAt, '2026-11-01T12:00:00+09:00');
});

test('authUrl carries client id, loopback redirect, offline access and the upload scope', () => {
    const u = new URL(authUrl({ clientId: 'cid', redirectUri: 'http://127.0.0.1:4321/cb', state: 'xyz' }));
    assert.equal(u.origin + u.pathname, 'https://accounts.google.com/o/oauth2/v2/auth');
    assert.equal(u.searchParams.get('client_id'), 'cid');
    assert.equal(u.searchParams.get('redirect_uri'), 'http://127.0.0.1:4321/cb');
    assert.equal(u.searchParams.get('response_type'), 'code');
    assert.equal(u.searchParams.get('access_type'), 'offline');
    assert.equal(u.searchParams.get('prompt'), 'consent');
    assert.equal(u.searchParams.get('state'), 'xyz');
    assert.equal(u.searchParams.get('scope'), SCOPES.join(' '));
    assert.ok(SCOPES.includes('https://www.googleapis.com/auth/youtube.upload'));
});

test('videoUrl builds the watch link', () => {
    assert.equal(videoUrl('abc123'), 'https://www.youtube.com/watch?v=abc123');
});
