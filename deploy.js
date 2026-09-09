const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('Building app...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('Getting remote URL...');
  const remoteUrl = execSync('git config --get remote.origin.url').toString().trim();

  const buildPath = path.join(__dirname, 'build');
  process.chdir(buildPath);

  console.log('Initializing git in build directory...');
  // Delete .git if it exists from a previous run
  if (fs.existsSync('.git')) {
    fs.rmSync('.git', { recursive: true, force: true });
  }

  execSync('git init');
  execSync('git checkout -b gh-pages');
  
  // Jekyll 처리를 방지하는 .nojekyll 파일 생성 (없으면 static/ 폴더가 무시됨)
  fs.writeFileSync('.nojekyll', '');

  console.log('Adding and committing files...');
  execSync('git add -A');
  execSync('git commit -m "Deploy to gh-pages"');
  
  console.log('Pushing to gh-pages...');
  execSync(`git push -f ${remoteUrl} gh-pages`);
  
  console.log("Deployed successfully!");
} catch (e) {
  console.error('Deployment failed:');
  if (e.stdout) console.error(e.stdout.toString());
  if (e.stderr) console.error(e.stderr.toString());
  console.error(e.message);
  process.exit(1);
}
