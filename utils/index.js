import xlsx from 'xlsx';
import fs from 'fs';

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



