/** @type {import('next').NextConfig} */
const nextConfig = {
    // 旧挙動維持。react-stomp が dev の二重マウントに耐えない可能性があるため。
    // Stage 2(通信層刷新)完了後に true 化を検討する
    reactStrictMode: false,
};

export default nextConfig;
