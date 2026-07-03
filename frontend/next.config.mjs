/** @type {import('next').NextConfig} */
const nextConfig = {
    // 旧挙動維持。react-stomp が dev の二重マウントに耐えない可能性があるため。
    // Stage 2(通信層刷新)完了後に true 化を検討する
    reactStrictMode: false,
    eslint: {
        // 旧 .eslintrc.js(ESLint 7)のまま build の lint を通せないため一時的に無効化。
        // Task 5(ESLint 9 移行)で解除する
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
