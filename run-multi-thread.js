const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Biến cấu hình
const isHeadless = process.env.HEADLESS === 'true';
const isHttp = process.env.HTTP === 'true';

const browser = isHeadless ? 'chrome:headless' : 'chrome';
const testFile = './tests/runTestWithDataGen/runTestWithDataGen.test.js';
const browserArgs = isHttp ? '--disable-proxy --disable-native-automation' : '';

// Đọc danh sách file data
const dataFolder = path.join(__dirname, 'test-data', 'data-file');
const files = fs.readdirSync(dataFolder);

// Trích các chỉ số thread từ file `data-file-N.json`
const threadIndexes = files
  .map(file => {
    const match = file.match(/^data-file-(\d+)\.json$/);
    return match ? parseInt(match[1], 10) : null;
  })
  .filter(index => index !== null)
  .sort((a, b) => a - b); // chạy theo thứ tự tăng dần

if (threadIndexes.length === 0) {
  console.error('❌ Không tìm thấy file dạng data-file-<index>.json trong thư mục data-file/');
  process.exit(1);
}

function runTest(index) {
  return new Promise((resolve, reject) => {
    const cmd = index === 1
        ? `npx testcafe ${browser} ${browserArgs} ${testFile}`
        : `npx testcafe -c ${index} ${browser} ${browserArgs} ${testFile}`;
    const envVars = { ...process.env, THREAD_INDEX: index.toString() };

    console.log(`👉 Running: THREAD_INDEX=${index} → ${cmd}`);
    const child = exec(cmd, { env: envVars }, (err, stdout, stderr) => {
      if (err) {
        console.error(`❌ THREAD ${index} failed:\n${stderr}`);
        resolve();
      } else {
        console.log(`✅ THREAD ${index} finished:\n${stdout}`);
        resolve();
      }
    });

    // Optional: Show realtime output
    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);
  });
}

(async () => {
  for (const index of threadIndexes) {
    try {
      await runTest(index);
    } catch (err) {
      console.error(`⚠️ Stopped at THREAD_INDEX=${index} due to an error.`);
      break; // Dừng nếu 1 luồng lỗi
    }
  }

  console.log('🏁 All threads have completed.');
})();
