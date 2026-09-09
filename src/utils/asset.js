// public 폴더의 자산 경로에 배포 베이스 경로를 붙입니다.
// homepage가 "."일 때 PUBLIC_URL은 빈 문자열("")이 됩니다. 이 경우 상대 경로("./")를 사용합니다.
const base = process.env.PUBLIC_URL || '.';

export const asset = (path) => {
    if (!path || typeof path !== 'string') return '';
    if (/^https?:\/\//.test(path)) return path;
    if (path.startsWith('//')) return `https:${path}`;
    // 이미 베이스가 붙은 값은 그대로 둡니다(중복 접두사 방지).
    if (path === base || path.startsWith(`${base}/`)) return path;
    return `${base}/${path.replace(/^\//, '')}`;
};

export default asset;
