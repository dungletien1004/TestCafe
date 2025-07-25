import { openPage, ViewFilePage } from '../page-object/pages';
import { ClientFunction } from 'testcafe';
import { readFileNameFromJsonFile, logTimeToExcel, prepareReportFolderWithBackup, logValueToExcel } from '../utils';

const getLocation = ClientFunction(() => window.location.href);
const openFilePage = new openPage();
const viewFilePage = new ViewFilePage();

const fileNames = readFileNameFromJsonFile('test-data/fileNames.json');
prepareReportFolderWithBackup();
const fileExcelName = 'openFile-Test-Performance-R223';
const URL = 'http://localhost:2200/autoTest'; // Change to your desired URL

fixture `Open file Localhost`
    .page`${URL}`;

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
      await t.wait(1000);
      console.log('Clear cache');
      const selectedFile = openFilePage.getSelectedFileByName(fileName);
      await t.expect(selectedFile.exists).ok(`File "${fileName}" is not selected or not displayed in selected list`);

     // Phase 2
     await openFilePage.clickViewButton();
     phaseStart = Date.now();
     await openFilePage.waitForUrlToChange('/main?AUTHCODE', fileItem, 3600000); // 60 minutes
     const currentUrl = await getLocation();
     await t.expect(currentUrl).contains('/main?AUTHCODE', 'URL is not correct after click View');
     logValueToExcel(fileName, 'Caching', (Date.now() - phaseStart) / 1000, fileExcelName);
     console.log('Caching: ' + (Date.now() - phaseStart) / 1000, ' s');
     const timeLoad = Date.now();
     await viewFilePage.waitForLoadingToFinish();
     await t.wait(200);
     const fileNameInView = await viewFilePage.getFileName();
     await t.expect(fileNameInView).contains(fileName, `File name is not correct in View Page`);
     logValueToExcel(fileName, 'Loading default sheet', (Date.now() - timeLoad - 200) / 1000, fileExcelName);

      // Phase 4 Reopen 
      console.log('Reopen file: ', fileName);
      await t.navigateTo(URL);
      await openFilePage.waitForLoadingToFinish();
      await openFilePage.searchForFile(fileName);
      await t.wait(1000);
      await openFilePage.clickItem(fileItem);
      await t.wait(200);
      const selectedFileV2 = openFilePage.getSelectedFileByName(fileName);
      await t.expect(selectedFileV2.exists).ok(`File "${fileName}" is not selected or not displayed in selected list`);
      await openFilePage.clickViewButton();

      phaseStart = Date.now();
      await openFilePage.waitForUrlToChange('/main?AUTHCODE', fileItem, 3600000); // 60 minutes
      const currentUrlV2 = await getLocation();
      await t.expect(currentUrlV2).contains('/main?AUTHCODE', 'URL is not correct after click View');
      phaseTimes['Open file V2 (No Caching)'] = Date.now() - phaseStart;

      phaseStart = Date.now();
      await viewFilePage.waitForLoadingToFinish();
      await t.wait(200);
      const fileNameInViewV2 = await viewFilePage.getFileName();
      await t.expect(fileNameInViewV2).contains(fileName, `File name is not correct in View Page`);
      phaseTimes['Check file in View Page V2'] = Date.now() - phaseStart;
    } catch (error) {
      console.error(`❌ Test failed for "${fileName}":`, error);
      const errorMessage = error.message || error.errMsg;
      logValueToExcel(fileName, 'Test Error', errorMessage, fileExcelName);
      const allPhases = [
        'Open file V2 (No Caching)',
        'Check file in View Page V2'
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
    
