const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const jsonDir = path.join(__dirname, 'src', 'json');
const publicDir = path.join(__dirname, 'public');

// 다운로드할 이미지들을 담을 큐 (중복 제거 전)
const rawDownloadQueue = [];

// 객체를 순회하며 URL을 찾고 변경하는 재귀 함수
function processObject(obj) {
  if (typeof obj === 'string') {
    if (obj.startsWith('http://') || obj.startsWith('https://')) {
      try {
        const parsedUrl = new URL(obj);
        const pathname = parsedUrl.pathname; 

        // 이미지 확장자인지 확인
        const isImage = /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(pathname);
        
        if (isImage) {
            // 로컬 파일 경로용 (쿼리스트링 제거 및 URL 디코딩)
            const cleanPathname = decodeURIComponent(pathname);
            const savePath = path.join(publicDir, cleanPathname);
            
            rawDownloadQueue.push({ url: obj, savePath });
            
            // JSON에 저장될 새 주소 (로컬 경로)
            return cleanPathname;
        } else {
            // 이미지가 아닌 일반 페이지 링크는 쿼리스트링 포함해서 상대 경로로 변환
            const localLink = decodeURIComponent(pathname + parsedUrl.search);
            return localLink;
        }
      } catch (e) {
        console.error("URL 파싱 에러:", obj);
        return obj; // 파싱 실패 시 원본 유지
      }
    }
    return obj;
  } else if (Array.isArray(obj)) {
    return obj.map(item => processObject(item));
  } else if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      newObj[key] = processObject(obj[key]);
    }
    return newObj;
  }
  return obj;
}

// 파일 다운로드 함수
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    // 이미 파일이 존재하면 다운로드 생략
    if (fs.existsSync(dest)) {
      return resolve('exists');
    }

    // 디렉토리 생성
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve('downloaded');
        });
        file.on('error', (err) => {
          fs.unlink(dest, () => {}); // 에러 발생 시 부분적으로 받아진 파일 삭제
          reject(err);
        });
      } else if (res.statusCode === 301 || res.statusCode === 302) {
         // 리다이렉션 처리
         downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      } else {
        reject(new Error(`Status: ${res.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// 큐에 있는 이미지를 병렬로 다운로드하는 함수
async function processQueue(concurrency, queue) {
  console.log(`총 ${queue.length}개의 중복 없는 이미지 다운로드를 시작합니다...`);
  
  let index = 0;
  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  const workers = Array(concurrency).fill(null).map(async () => {
    while (index < queue.length) {
      const taskIndex = index++;
      const task = queue[taskIndex];
      try {
        const result = await downloadFile(task.url, task.savePath);
        if (result === 'exists') skipCount++;
        else successCount++;
        
        if (taskIndex % 50 === 0 || taskIndex === queue.length - 1) {
          console.log(`[진행 상황] ${taskIndex + 1} / ${queue.length}`);
        }
      } catch (err) {
        console.error(`다운로드 실패 (${task.url}): ${err.message}`);
        failCount++;
      }
    }
  });

  await Promise.all(workers);
  console.log('\n=======================================');
  console.log('🎉 모든 다운로드 및 변환 작업이 완료되었습니다!');
  console.log(`- 성공적으로 새로 다운받은 파일: ${successCount}개`);
  console.log(`- 이미 존재해서 건너뛴 파일: ${skipCount}개`);
  console.log(`- 다운로드 실패: ${failCount}개`);
  console.log('=======================================\n');
}

async function run() {
  console.log('1. JSON 파일 경로 변환을 시작합니다...');
  const files = fs.readdirSync(jsonDir).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    const filePath = path.join(jsonDir, file);
    
    const content = fs.readFileSync(filePath, 'utf-8');
    let data;
    try {
      data = JSON.parse(content);
    } catch (e) {
      console.error(`[오류] ${file} JSON 파싱 실패`);
      continue;
    }
    
    // 객체 순회하며 로컬 링크로 변환 및 다운로드 큐 적재
    const newData = processObject(data);
    
    // 변경된 내용 덮어쓰기
    fs.writeFileSync(filePath, JSON.stringify(newData, null, 2), 'utf-8');
    console.log(`  ✔️ ${file} 경로 업데이트 완료`);
  }

  // 중복 큐 제거 (동일한 이미지 여러 번 호출되는 것 방지)
  const uniqueQueueMap = new Map();
  rawDownloadQueue.forEach(item => uniqueQueueMap.set(item.url, item));
  const uniqueQueue = Array.from(uniqueQueueMap.values());
  
  console.log('\n2. 이미지 다운로드를 시작합니다...');
  
  // 병렬로 20개씩 다운로드 처리
  await processQueue(20, uniqueQueue);
}

run();
