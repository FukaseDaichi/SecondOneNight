import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('SystemConst.Server', () => {
    beforeEach(() => {
        vi.unstubAllEnvs();
        vi.resetModules();
    });

    it('環境変数が未設定なら本番URLにフォールバックする', async () => {
        const { SystemConst } = await import('./next.config');
        expect(SystemConst.Server.AP_HOST).toBe(
            'https://boardgameap.herokuapp.com/'
        );
        expect(SystemConst.Server.SITE_URL).toBe(
            'https://board-game-three.vercel.app'
        );
    });

    it('NEXT_PUBLIC_AP_HOST が設定されていればそれを使う', async () => {
        vi.stubEnv('NEXT_PUBLIC_AP_HOST', 'http://localhost:8080/');
        vi.resetModules();
        const { SystemConst } = await import('./next.config');
        expect(SystemConst.Server.AP_HOST).toBe('http://localhost:8080/');
    });

    it('NEXT_PUBLIC_SITE_URL が設定されていればそれを使う', async () => {
        vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000');
        vi.resetModules();
        const { SystemConst } = await import('./next.config');
        expect(SystemConst.Server.SITE_URL).toBe('http://localhost:3000');
    });
});
