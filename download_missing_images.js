const fs = require('fs');
const path = require('path');
const https = require('https');

const bannerData = require('./src/json/05.json');
const mainCategoryProducts = bannerData.data?.["1_DISPLAY_MAIN_PRODUCT"] || {};

// 사이즈 25KB 이상인 정상 이미지만 찾아주는 스마트 다운로드 함수
const tryDownload = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Not Found (${res.statusCode})`));
        return;
      }
      // 컨텐츠 길이 체크 (25000 바이트 이하면 가짜 No Image로 간주)
      const contentLength = parseInt(res.headers['content-length'], 10);
      if (contentLength && contentLength < 25000) {
         reject(new Error('Fake No Image'));
         return;
      }
      
      const fileStream = fs.createWriteStream(filepath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(url);
      });
      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => reject(err));
      });
    }).on('error', reject);
  });
};

const run = async () => {
  const dir = path.join(__dirname, 'public', 'images', 'products');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  console.log('🚀 스마트 딥서치: 누락된 상품 원본 이미지를 찾아 다운로드합니다...');
  
  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const category of Object.values(mainCategoryProducts)) {
    for (const product of category.products) {
      const filepath = path.join(dir, `${product.code}.jpg`);
      
      // 가짜 이미지 사전 삭제
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        if (stats.size < 25000) {
          fs.unlinkSync(filepath);
        } else {
          skipCount++;
          continue;
        }
      }

      // 원본 주소가 유실되었을 확률이 높으므로 가능한 모든 CDN 조합을 후보군에 넣음
      const candidates = [
        `https://product.mujikorea.co.kr/images/products/${product.code}/${product.code}_1260.jpg`,
        `https://product.mujikorea.co.kr/images/products/${product.product_id}/${product.product_id}_1260.jpg`,
        `https://product.mujikorea.co.kr/images/products/${product.code}/${product.code}_400.jpg`,
        `https://product.mujikorea.co.kr/images/products/${product.product_id}/${product.product_id}_400.jpg`,
        `https://public.mujikorea.co.kr/images/products/${product.code}.jpg`
      ];

      // 옵션에 있는 이미지 주소도 유력한 후보로 추가
      if (product.options && product.options.color) {
        const colors = Object.values(product.options.color);
        if (colors.length > 0 && colors[0].images && colors[0].images[0]) {
           const optUrl = colors[0].images[0];
           if (optUrl.startsWith('http')) candidates.unshift(optUrl);
           else candidates.unshift(`https://public.mujikorea.co.kr${optUrl}`);
        }
      }

      let downloaded = false;
      for (const url of candidates) {
        try {
          const foundUrl = await tryDownload(url, filepath);
          console.log(`✅ [${product.code}] 다운로드 성공 (출처: ${foundUrl})`);
          successCount++;
          downloaded = true;
          break; // 성공하면 다음 후보군 생략
        } catch (e) {
          // 실패하면 조용히 다음 후보로 넘어감
        }
      }

      if (!downloaded) {
        console.error(`❌ [${product.code}] 모든 후보 경로 탐색 실패 (진짜 사진 없음)`);
        failCount++;
      }
    }
  }
  console.log('--------------------------------------------------');
  console.log(`🎉 딥서치 완료! (성공: ${successCount}개, 스킵: ${skipCount}개, 영구실패: ${failCount}개)`);
};

run();
