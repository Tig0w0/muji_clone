const fs = require('fs');
const path = require('path');
const assetImport = "import { asset } from '../utils/asset';\n";

const fix = (f, cb) => {
  let p = path.join(process.cwd(), 'src/components', f);
  let c = fs.readFileSync(p, 'utf8');
  if(!c.includes("import { asset }")) c = c.replace(/^(import .*?;?\r?\n)/m, "$1" + assetImport);
  c = cb(c);
  fs.writeFileSync(p, c, 'utf8');
};

fix('Header.js', c => c.replace(/'(\/media\/images\/support_bn_[^']+)'/g, "asset('$1')").replace(/src="(\/(images|media)\/[^"]+)"/g, "src={asset('$1')}"));
fix('Footer.js', c => c.replace(/src="(\/images\/[^"]+)"/g, "src={asset('$1')}"));
fix('Banner.js', c => c.replace(/src="(\/images\/[^"]+)"/g, "src={asset('$1')}").replace(/src=\{item\.banner_image_url\}/g, "src={asset(item.banner_image_url)}"));
fix('CircleNav.js', c => c.replace(/src=\{`(\/images\/banner\/\$\{item\.img\})`\}/g, "src={asset(`$1`)}").replace(/src="(\/images\/icons\/[^"]+)"/g, "src={asset('$1')}"));
fix('NewArrivals.js', c => c.replace(/src="(\/images\/icons\/[^"]+)"/g, "src={asset('$1')}"));
fix('ProductInfo.js', c => c.replace(/src="(\/images\/[^"]+)"/g, "src={asset('$1')}"));
console.log('Done');
