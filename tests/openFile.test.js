import { openPage, ViewFilePage } from '../page-object/pages';
import { ClientFunction } from 'testcafe';
import { readFileNameFromJsonFile, logTimeToExcel, prepareReportFolderOnce } from '../utils';

const getLocation = ClientFunction(() => window.location.href);
const openFilePage = new openPage();
const viewFilePage = new ViewFilePage();

const fileNames = readFileNameFromJsonFile('test-data/fileNames.json');
prepareReportFolderOnce();

fixture `Open file R2.3dviewer or localhost`
    // .page`http://r2.3dviewer.anybim.vn/autoTest`;
    .page`http://localhost:4200/autoTest`;

fileNames.forEach((item) => {
  test(`${item.expect ? 'Should open' : 'Should not find'} file: ${item.fileName}`, async t => {
    const startTime = Date.now();
    const phaseTimes = {};
    const fileName = item.fileName;
    console.log(`Start test for file: ${fileName}`);
    try {
      // Phase 1.1
      let phaseStart = Date.now();
      await openFilePage.waitForLoadingToFinish();
      phaseTimes['Wait for loading'] = Date.now() - phaseStart;
      // Phase 1.2 Search for file and click on it
      phaseStart = Date.now();
      await openFilePage.searchForFile(fileName);
      await t.wait(1000);
      const fileItem = await openFilePage.getItem(fileName);

      if (!item.expect) {
        if (fileItem) {
          await t.expect(fileItem.exists).notOk(`File "${fileName}" was found but should NOT exist in search results`);
        }
        return;
      }

      await t.expect(fileItem.exists).ok(`Expected file "${fileName}" to be found, but it was not.`);
      await openFilePage.clickItem(fileName);
      await openFilePage.clearCache(fileName);
      await t.wait(200);

      const selectedFile = openFilePage.getSelectedFileByName(fileName);
      await t.expect(selectedFile.exists).ok(`File "${fileName}" is not selected or not displayed in selected list`);
      phaseTimes['Open & clear cache'] = Date.now() - phaseStart - 1200;

      // Phase 2
      phaseStart = Date.now();
      await openFilePage.clickViewButton();
      await openFilePage.waitForUrlToChange('/main?AUTHCODE', 360000); // 6 minutes
      const currentUrl = await getLocation();
      await t.expect(currentUrl).contains('/main?AUTHCODE', 'URL is not correct after click View');
      phaseTimes['Wait for Open file'] = Date.now() - phaseStart;

      // Phase 3
      phaseStart = Date.now();
      await viewFilePage.waitForLoadingToFinish();
      await t.wait(200);
      const fileNameInView = await viewFilePage.getFileName();
      await t.expect(fileNameInView).contains(fileName, `File name is not correct in View Page`);
      phaseTimes['Check file in View Page'] = Date.now() - phaseStart - 200;
    } catch (error) {
      console.error(`❌ Test failed for "${fileName}":`, error);

      // Danh sách tất cả phase cố định
      const allPhases = [
        'Wait for loading',
        'Open & clear cache',
        'Wait for Open file',
        'Check file in View Page'
      ];

      // Gán "FAIL" cho các phase chưa có
      for (const phase of allPhases) {
        if (!(phase in phaseTimes)) {
          phaseTimes[phase] = 'null';
        }
      }
      throw error;
    } finally {
      const totalTime = Date.now() - startTime;
      if (!('Total' in phaseTimes)) {
        phaseTimes['Total'] = typeof totalTime === 'number' ? totalTime : 'FAIL';
      }
      logTimeToExcel(fileName, phaseTimes, 'r2-3dviewer-or-localhost');
    }
  });
});
    
