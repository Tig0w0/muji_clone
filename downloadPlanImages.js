const fs = require('fs');
const path = require('path');
const https = require('https');

const jsonPath = path.join(__dirname, 'src', 'json', '04.json');
const publicDir = path.join(__dirname, 'public');

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const fullDest = path.join(publicDir, dest);
    const dir = path.dirname(fullDest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (fs.existsSync(fullDest)) return resolve('exists');

    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(fullDest);
        res.pipe(file);
        file.on('finish', () => resolve('downloaded'));
      } else {
        reject(new Error(`Status ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function run() {
  const content = fs.readFileSync(jsonPath, 'utf-8');
  // 기획전 상세페이지(HTML 문자열 안)에 쓰인 이미지나 영상 주소를 정규식으로 추출
  const regex = /https:\/\/public\.mujikorea\.co\.kr\/images\/plans\/[^"'\s\)\\]+\.(jpg|jpeg|png|mp4|svg|webp)/ig;
  
  const matches = content.match(regex) || [];
  const uniqueUrls = [...new Set(matches)];
  
  console.log(`총 ${uniqueUrls.length}개의 고유 에셋을 찾았습니다. 다운로드 시작...`);
  
  let success = 0, skip = 0, fail = 0;
  // 부하를 줄이기 위해 순차 다운로드
  for (const url of uniqueUrls) {
    try {
      const parsed = new URL(url);
      const dest = decodeURIComponent(parsed.pathname); // ex: /images/plans/main.jpg
      const result = await downloadFile(url, dest);
      
      if (result === 'exists') skip++;
      else success++;
    } catch(e) {
      console.log(`다운로드 실패: ${url}`, e.message);
      fail++;
    }
  }
  
  console.log('==================================');
  console.log(`🎉 기획전 에셋 다운로드 완료!`);
  console.log(`- 새로 다운로드: ${success}개`);
  console.log(`- 이미 존재(스킵): ${skip}개`);
  console.log(`- 실패: ${fail}개`);
  console.log('==================================');
}
run();
