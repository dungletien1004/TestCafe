import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';


/**
 * Reset (clear) a JSON file to an empty array.
 * @param filePath - Đường dẫn tới file JSON cần reset
 */
export function resetJsonFile(filePath) {
    fs.writeFileSync(filePath, '[]', 'utf-8');
  }
export function resetAllJsonFilesInFolder(folderPath) {
  const absolutePath = path.resolve(folderPath);
  const files = fs.readdirSync(absolutePath);

  files.forEach((file) => {
    const filePath = path.join(absolutePath, file);
    if (file.endsWith('.json') && fs.statSync(filePath).isFile()) {
      fs.writeFileSync(filePath, '[]', 'utf-8');
      console.log(`Reset file: ${filePath}`);
    }
  });
}
export function logFileInfo(
    outputPath,
    entry
  ) {
    let data = [];
  
    // Đọc file nếu tồn tại
    if (fs.existsSync(outputPath)) {
      const raw = fs.readFileSync(outputPath, 'utf-8');
      try {
        data = JSON.parse(raw);
      } catch (err) {
        console.error('❌ JSON parse error:', err);
      }
    }
  
    // Thêm entry mới
    data.push(entry);
  
    // Ghi lại toàn bộ file
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  }
  
export function prepareReportFolderOnce() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');

    const dateStr = `${yyyy}-${mm}-${dd}`;     // 📁 day folder: 2025-05-30
    const timeStr = `${hh}${min}${ss}`;        // 🕒 time to backup: 154230

    const baseFolder = path.join(process.cwd(), 'report', 'excel');
    const todayFolder = path.join(baseFolder, dateStr); // ✅ day folder
    const backupFolder = path.join(baseFolder, `backup-${dateStr}_${timeStr}`);

    // if day folder exists, backup
    if (fs.existsSync(todayFolder)) {
        fs.mkdirSync(backupFolder, { recursive: true });

        // iterate all items in todayFolder to copy manually
        const items = fs.readdirSync(todayFolder);
        for (const item of items) {
            const srcPath = path.join(todayFolder, item);
            const destPath = path.join(backupFolder, item);
            const stat = fs.statSync(srcPath);

            if (stat.isFile()) {
                fs.copyFileSync(srcPath, destPath);
            } else if (stat.isDirectory()) {
                copyFolderRecursiveSync(srcPath, destPath);
            }
        }

        console.log(`📁 Backed up ${todayFolder} to ${backupFolder}`);
    }

    // ensure day folder exists to save new file
    fs.mkdirSync(todayFolder, { recursive: true });
}

// function to copy folder recursively using fs
function copyFolderRecursiveSync(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
    }

    const entries = fs.readdirSync(src);
    for (const entry of entries) {
        const srcPath = path.join(src, entry);
        const destPath = path.join(dest, entry);
        const stat = fs.statSync(srcPath);

        if (stat.isDirectory()) {
            copyFolderRecursiveSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// function to create path to save file by day
function getExcelLogPath(excelName) {
    const now = new Date();

    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    const folderPath = path.join(process.cwd(), 'report', 'excel', `${yyyy}-${mm}-${dd}`);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    const fileName = `report-${excelName}-${dd}-${mm}-${yyyy}.xlsx`;
    return path.join(folderPath, fileName);
}

export function logTimeToExcel(fileName, phaseTimes, excelName) {
    const logExcelPath = getExcelLogPath(excelName);

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

    // add phase and time to row
    for (const [phase, time] of Object.entries(phaseTimes)) {
        if (typeof time === 'number') {
            row[phase] = (time / 1000).toFixed(2);
        } else {
            row[phase] = time; // keep string value like "null"
        }
    }

    const newSheet = xlsx.utils.json_to_sheet(data);
    workbook.SheetNames.length = 0;
    xlsx.utils.book_append_sheet(workbook, newSheet, 'TestTime');
    xlsx.writeFile(workbook, logExcelPath);
}

export function logValueToExcel(fileName, title, value, excelName) {
    const logExcelPath = getExcelLogPath(excelName); // ✅ giống hàm logTimeToExcel

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

    // ✅ Tìm dòng chứa đúng fileName
    let row = data.find(d => d.fileName === fileName);
    if (!row) {
        row = { fileName };
        data.push(row);
    }

    // ✅ Gán giá trị mới
    row[title] = row[title] ? `${row[title]}\r\n${value}` : `${value}`;
    const newSheet = xlsx.utils.json_to_sheet(data);
    workbook.SheetNames.length = 0;
    xlsx.utils.book_append_sheet(workbook, newSheet, 'TestTime');
    xlsx.writeFile(workbook, logExcelPath);
}
/**
 * read and parse json file contains fileName and expect
 * @param {string} jsonFilePath - path to json file
 * @returns {Array<Object>} - array of object with structure { fileName, expect }
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



