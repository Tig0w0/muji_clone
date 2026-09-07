const fs = require('fs');
const https = require('https');
const path = require('path');

const JSON_PATH = path.join(__dirname, '05.json');
const TARGET_DIR = path.join(__dirname, '../../public/images/products');

// 폴더 생성
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// 파일 다운로드 헬퍼
function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      return resolve(true); // 이미 다운로드 된 파일은 패스
    }
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else {
        file.close();
        fs.unlink(dest, () => {}); // 에러난 파일 삭제
        resolve(false);
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      resolve(false);
    });
  });
}

async function processImages() {
  const dataRaw = fs.readFileSync(JSON_PATH, 'utf8');
  let data;
  try {
    data = JSON.parse(dataRaw);
  } catch (e) {
    console.error('JSON 파싱 에러', e);
    return;
  }

  const productsDict = data?.data?.["1_DISPLAY_MAIN_PRODUCT"] || {};
  let totalDownloads = 0;
  
  for (const key of Object.keys(productsDict)) {
    const list = productsDict[key].products || [];
    for (const product of list) {
      let imgUrl = '';
      
      // 원본 이미지 URL 찾기
      if (product.options && product.options.color) {
        const colors = Object.values(product.options.color);
        if (colors.length > 0 && colors[0].images && colors[0].images.length > 0) {
          imgUrl = colors[0].images[0];
        }
      }
      if (!imgUrl && product.options && product.options.option) {
        const opts = Object.values(product.options.option);
        if (opts.length > 0 && opts[0].images && opts[0].images.length > 0) {
          imgUrl = opts[0].images[0];
        }
      }
      if (!imgUrl) {
        imgUrl = `https://product.mujikorea.co.kr/images/products/${product.code}/${product.code}_1260.jpg`;
      }
      
      if (!imgUrl.startsWith('http')) {
        imgUrl = `https://product.mujikorea.co.kr${imgUrl}`;
      }

      const localFilename = `${product.code}.jpg`;
      const localPath = path.join(TARGET_DIR, localFilename);
      const webPath = `/images/products/${localFilename}`;

      console.log(`Downloading: ${imgUrl} -> ${localPath}`);
      const success = await downloadImage(imgUrl, localPath);
      
      if (success) {
        totalDownloads++;
        // 다운받은 로컬 경로를 thumbnail_list에 최우선으로 삽입하여 데이터 갱신
        if (!product.thumbnail_list) product.thumbnail_list = [];
        product.thumbnail_list.unshift(webPath); // 인덱스 0에 삽입
      }
    }
  }

  console.log(`Total downloaded/processed: ${totalDownloads}`);
  
  // 수정된 JSON 덮어쓰기
  fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), 'utf8');
  console.log('05.json updated successfully!');
}

processImages();
