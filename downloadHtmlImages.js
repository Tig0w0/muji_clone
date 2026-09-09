const fs = require('fs');
const https = require('https');
const path = require('path');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      resolve();
      return;
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        if (res.statusCode === 404) {
          console.log(`[404] ${url}`);
          resolve(false);
          return;
        }
        reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
        return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(true));
      });
      file.on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
    }).on('error', reject);
  });
}

async function run() {
  const dataPath = path.join(__dirname, 'src', 'json', 'main_plan.json');
  const rawData = fs.readFileSync(dataPath, 'utf8');
  
  // Find all "/images/plans/..." or "/images/products/..." in the JSON string
  const imgRegex = /src=\\"(\/images\/[^\\]+)\\"/g;
  
  let match;
  const urlsToDownload = new Set();
  
  while ((match = imgRegex.exec(rawData)) !== null) {
    urlsToDownload.add(match[1]);
  }
  
  console.log(`Found ${urlsToDownload.size} unique images inside HTML strings.`);
  
  const urls = Array.from(urlsToDownload);
  let downloadedCount = 0;
  
  for (let i = 0; i < urls.length; i++) {
    const localPath = urls[i];
    const remoteUrl = `https://public.mujikorea.co.kr${localPath}`;
    const destPath = path.join(__dirname, 'public', localPath);
    
    try {
      const downloaded = await downloadImage(remoteUrl, destPath);
      if (downloaded) {
        downloadedCount++;
        if (downloadedCount % 10 === 0) console.log(`Downloaded ${downloadedCount}/${urls.length}`);
      }
    } catch (e) {
      console.error(`Error downloading ${remoteUrl}:`, e.message);
    }
    await delay(50); // throttle slightly
  }
  
  console.log(`Done! Downloaded ${downloadedCount} missing images.`);
}

run();
