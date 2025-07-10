import { ClientFunction } from 'testcafe';
import { readFileNameFromJsonFile, logTimeToExcel, prepareReportFolderOnce, logValueToExcel } from '../../utils';
import openPage from '../../page-object/pages/openPage';
import ViewFilePage from '../../page-object/pages/viewFilePage';

const getLocation = ClientFunction(() => window.location.href);
const openFilePage = new openPage();
const viewFilePage = new ViewFilePage();

const threadIndex = process.env.THREAD_INDEX || '1'; // Lấy từ biến môi trường
const filePath = `test-data/data-file/data-file-${threadIndex}.json`;
const fileNames = readFileNameFromJsonFile(filePath);
// const fileNames = readFileNameFromJsonFile('test-data/data-file/data-file.json');
prepareReportFolderOnce();
const fileExcelName = `runTestWithDataGen_thread${threadIndex}_Dev`;

fixture `Run test with data generated from folder path`
    .page`http://localhost:4200/autoTest`;
    // .page`http://r2.3dviewer.anybim.vn/autoTest`;
    // .page`http://dev-test:4200/autoTest`;

fileNames.forEach((item) => {
  test(`${item.expectFileFound ? 'Should open' : 'Should not find'} file: ${item.fileName}`, async t => {
    const phaseTimes = {};
    const fileName = item.fileName;
    console.log(`Start test for file: ${fileName}`);
    try {
      // Phase 1.1
      let phaseStart = Date.now();
      await openFilePage.waitForLoadingToFinish();
      // Phase 1.2 Search for file and click on it
      await openFilePage.searchForFile(fileName);
      await t.wait(1000);
      const fileItem = await openFilePage.getItem(fileName, item.path);
      logValueToExcel(fileName, 'Expected file found', item.expectFileFound, fileExcelName);
      if (!item.expectFileFound) {
        if (fileItem) {
          await t.expect(fileItem.exists).notOk(`File "${fileName}" was found but should NOT exist in search results`);
        }
        return;
      }

      await t.expect(fileItem.exists).ok(`Expected file "${fileName}" to be found, but it was not.`);
      const fileSize = await openFilePage.getFileSize(fileItem);
      console.log(`File size: ${fileSize}`);
      logValueToExcel(fileName, 'File size', fileSize, fileExcelName);
      await openFilePage.clickItem(fileItem);
      await openFilePage.clearCache(fileItem);
      await t.wait(200);

      const selectedFile = openFilePage.getSelectedFileByName(fileName);
      await t.expect(selectedFile.exists).ok(`File "${fileName}" is not selected or not displayed in selected list`);

      // Phase 2
      phaseStart = Date.now();
      await openFilePage.clickViewButton();
      await openFilePage.waitForUrlToChange('/main?AUTHCODE', fileItem, 1800000); // 30 minutes
      const currentUrl = await getLocation();
      await t.expect(currentUrl).contains('/main?AUTHCODE', 'URL is not correct after click View');
      const timeLoad = Date.now();
      await viewFilePage.waitForLoadingToFinish();
      await t.wait(200);
      const fileNameInView = await viewFilePage.getFileName();
      await t.expect(fileNameInView).contains(fileName, `File name is not correct in View Page`);
      logValueToExcel(fileName, 'Loading default sheet (s)', (Date.now() - timeLoad - 200) / 1000, fileExcelName);
      phaseTimes['Caching (s)'] = Date.now() - phaseStart - 200;

      if (item.isHoop) {
        await viewFilePage.clickContentPanelButton();
        await viewFilePage.checkSheetItemNames(item, logValueToExcel, fileExcelName);
        for (const sheetName of item.sheetNames) {
          await viewFilePage.clickSheetItem(sheetName, fileName, fileExcelName);
        }
      }
    } catch (error) {
      console.error(`❌ Test failed for "${fileName}":`, error);
      const errorMessage = error.message || error.errMsg;
      logValueToExcel(fileName, 'Error', errorMessage, fileExcelName);
      const allPhases = [
        'Caching (s)'
      ];
      for (const phase of allPhases) {
        if (!(phase in phaseTimes)) {
          phaseTimes[phase] = 'null';
        }
      }
      throw error;
    } finally {
      logTimeToExcel(fileName, phaseTimes, fileExcelName);
    }
  });
});
    
