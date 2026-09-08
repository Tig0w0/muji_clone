const fs = require('fs');
const path = require('path');
const https = require('https');

const publicDir = path.join(__dirname, 'public');
const downloads = [
  { url: 'https://mujikorea.co.kr/_next/static/media/star.30hlrl68_3n_2.svg', dest: 'images/icons/star.svg' },
  { url: 'https://mujikorea.co.kr/_next/static/media/arrow_right_g.00gqkt3rc96uw.svg', dest: 'images/icons/arrow_right_g.svg' },
  { url: 'https://mujikorea.co.kr/_next/static/media/logo.1xh_mc-y7cty6.svg', dest: 'images/logo/logo.svg' },
  { url: 'https://mujikorea.co.kr/_next/static/media/arrow_bottom_g.1fey5a5dclep5.svg', dest: 'images/icons/arrow_bottom_g.svg' },
  { url: 'https://public.mujikorea.co.kr/images/shop/HCEPhhas2bgQlXwuhPYl7lC4YqjkdOxwmo0RhEiG.png', dest: 'images/icons/google_play.png' },
  { url: 'https://public.mujikorea.co.kr/images/shop/M1ma1a2LXJZsu0IDKv8x0fCHI9Wx6tIhvjGraNYW.svg', dest: 'images/icons/app_store.svg' },
  { url: 'https://public.mujikorea.co.kr/images/shop/Al5DRMaV1Ch91qC6NMsJvI76DNrJ436xhhzIuxMQ.svg', dest: 'images/icons/instagram.svg' },
  { url: 'https://public.mujikorea.co.kr/images/shop/LX5Ph4zZMk1qXwjbkNw2xLieSI0XKULVgYtdyNjH.svg', dest: 'images/icons/facebook.svg' },
  { url: 'https://public.mujikorea.co.kr/images/shop/GhGdgx5PwZyDjV12ByMAVbh4k05VUOeD4tAx9haK.svg', dest: 'images/icons/youtube.svg' },
  { url: 'https://mujikorea.co.kr/_next/static/media/arrow_right.2rkxjuegzh6o1.svg', dest: 'images/icons/arrow_right.svg' },
  { url: 'https://mujikorea.co.kr/_next/static/media/arrow_top.3gmw-khnw0884.svg', dest: 'images/icons/arrow_top.svg' },
  { url: 'https://mujikorea.co.kr/_next/static/media/arrow_prev.0m60iquqirhb3.svg', dest: 'images/icons/arrow_prev.svg' },
  { url: 'https://mujikorea.co.kr/_next/static/media/arrow_next.2o62v-g4yjes3.svg', dest: 'images/icons/arrow_next.svg' },
  { url: 'https://product.mujikorea.co.kr/images/products/4550723608695/4550723608695_1260.jpg?w=80', dest: 'images/products/4550723608695/4550723608695_1260.jpg' }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const fullDest = path.join(publicDir, dest);
    const dir = path.dirname(fullDest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(fullDest);
        res.pipe(file);
        file.on('finish', () => resolve(dest));
      } else {
        reject(new Error(`Fail ${res.statusCode} on ${url}`));
      }
    }).on('error', reject);
  });
}

async function run() {
  for (const task of downloads) {
    try {
      await downloadFile(task.url, task.dest);
      console.log(`Downloaded ${task.dest}`);
    } catch (e) {
      console.error(e.message);
    }
  }
}
run();
