const { exec } = require("child_process");
const fs = require("fs");

// Tạo thư mục "report" nếu chưa tồn tại
const reportDir = './report';
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

// Ghép lệnh test từ đối số đầu vào
const cmd = process.argv.slice(2).join(" ");

// Tạo tên file timestamp
const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, "-");
const reportPath = `${reportDir}/test-report-${timestamp}.html`;

// Lệnh cuối cùng (thêm redirect output)
const fullCmd = `${cmd} --reporter html > ${reportPath}`;

console.log(`▶️ Running: ${fullCmd}`);

// Chạy lệnh
exec(fullCmd, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Lỗi khi chạy lệnh:\n${error.message}`);
    return;
  }
  if (stderr) console.error(stderr);
  console.log(`✅ Test hoàn tất. Báo cáo lưu tại: ${reportPath}`);
});
