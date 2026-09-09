// public 폴더의 자산 경로에 배포 베이스 경로를 붙입니다.
// GitHub Pages 프로젝트 페이지처럼 하위 경로(/muji_clone/)로 서비스될 때
// '/images/...' 같은 루트 절대 경로는 도메인 루트를 가리켜 404가 나기 때문입니다.
const base = process.env.PUBLIC_URL || '';

export const asset = (path) => {
    if (!path || typeof path !== 'string') return '';
    if (/^https?:\/\//.test(path)) return path;
    if (path.startsWith('//')) return `https:${path}`;
    // 이미 베이스가 붙은 값은 그대로 둡니다(중복 접두사 방지).
    if (base && (path === base || path.startsWith(`${base}/`))) return path;
    return `${base}/${path.replace(/^\//, '')}`;
};

export default asset;
