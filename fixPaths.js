const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'PlanDetail.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace src="/images/..." with src={process.env.PUBLIC_URL + "/images/..."}
content = content.replace(/src="(\/images\/[^"]+)"/g, 'src={process.env.PUBLIC_URL + "$1"}');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed hardcoded image paths in PlanDetail.js');
