const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'src', 'json', '04.json');

function run() {
  try {
    const fileData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    let cleaned = false;
    
    if (fileData.data) {
      // data 객체의 모든 키(예: "1_PLAN_0", "1_PLAN_1" 등)를 순회
      for (const key in fileData.data) {
        const arr = fileData.data[key];
        if (Array.isArray(arr)) {
          arr.forEach(entry => {
            if (entry.plan && entry.plan.name && entry.plan.name.includes("인천상회편")) {
              console.log(`[정리 전] ${entry.plan.name} - pc_content 길이: ${entry.plan.pc_content ? entry.plan.pc_content.length : 0}`);
              entry.plan.pc_content = "";
              entry.plan.mobile_content = "";
              cleaned = true;
              console.log(`[정리 완료] ${entry.plan.name}의 거대한 HTML 문자열을 비웠습니다.`);
            }
          });
        }
      }
    }

    if (cleaned) {
      fs.writeFileSync(jsonPath, JSON.stringify(fileData, null, 2), 'utf8');
      console.log('04.json 파일 저장이 성공적으로 완료되었습니다.');
    } else {
      console.log('인천상회편 데이터를 찾지 못했습니다.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

run();
