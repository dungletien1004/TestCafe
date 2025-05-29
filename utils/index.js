import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

// Hàm tạo đường dẫn lưu file theo ngày
function getExcelLogPath() {
    const now = new Date();

    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    const folderPath = path.join(process.cwd(), 'report', 'excel', `${yyyy}-${mm}-${dd}`);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    const fileName = `report-${dd}-${mm}-${yyyy}.xlsx`;
    return path.join(folderPath, fileName);
}

export function logTimeToExcel(fileName, phaseTimes) {
    const logExcelPath = getExcelLogPath();

    let workbook;
    let sheet;
    let data = [];

    if (fs.existsSync(logExcelPath)) {
        workbook = xlsx.readFile(logExcelPath);
        sheet = workbook.Sheets[workbook.SheetNames[0]];
        data = xlsx.utils.sheet_to_json(sheet);
    } else {
        workbook = xlsx.utils.book_new();
    }

    // Tìm xem fileName đã tồn tại chưa
    let row = data.find(d => d.fileName === fileName);
    if (!row) {
        row = { fileName };
        data.push(row);
    }

    // Gán mỗi phase thành 1 cột, value là time (giây, 2 chữ số)
    for (const [phase, time] of Object.entries(phaseTimes)) {
        row[phase] = (time / 1000).toFixed(2);
    }

    const newSheet = xlsx.utils.json_to_sheet(data);
    workbook.SheetNames.length = 0;
    xlsx.utils.book_append_sheet(workbook, newSheet, 'TestTime');
    xlsx.writeFile(workbook, logExcelPath);
}
/**
 * Đọc và phân tích file JSON chứa danh sách fileName và expect
 * @param {string} jsonFilePath - Đường dẫn đến file JSON
 * @returns {Array<Object>} - Mảng các object có cấu trúc { fileName, expect }
 */
export function readFileNameFromJsonFile(jsonFilePath) {
    const rawData = fs.readFileSync(jsonFilePath, 'utf-8');
    const data = JSON.parse(rawData);

    return data;
}

export function readFileNamesFromExcel(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    return data.map(row => row.fileName); // assuming the header is "fileName"
}



