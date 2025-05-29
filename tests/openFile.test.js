import { openPage, ViewFilePage } from '../page-object/pages';
import { ClientFunction } from 'testcafe';
import { readFileNameFromJsonFile, logTimeToExcel } from '../utils';

const getLocation = ClientFunction(() => window.location.href);
const openFilePage = new openPage();
const viewFilePage = new ViewFilePage();

const fileNames = readFileNameFromJsonFile('test-data/fileNames.json');

fixture `Open file R2.3dviewer`
    .page`http://r2.3dviewer.anybim.vn/autoTest`;

fileNames.forEach((item) => {
  test(`${item.expect ? 'Should open' : 'Should not find'} file: ${item.fileName}`, async t => {
    const startTime = Date.now();
    const phaseTimes = {};
    const fileName = item.fileName;

    try {
      // Phase 1.1
      let phaseStart = Date.now();
      await t.expect(openFilePage.backgroundLoading.exists).ok({ timeout: 20000 });
      await t.expect(openFilePage.backgroundLoading.exists).notOk({ timeout: 20000 });
      phaseTimes['Wait for loading'] = Date.now() - phaseStart;

      // Phase 1.2
      phaseStart = Date.now();
      await openFilePage.searchForFile(fileName);
      await t.wait(1000);
      const fileItem = await openFilePage.getItem(fileName);
      phaseTimes['Search file'] = Date.now() - phaseStart - 1000;

      if (!item.expect) {
        phaseStart = Date.now();
        if (fileItem) {
          await t.expect(fileItem.exists).notOk(`File "${fileName}" was found but should NOT exist in search results`);
        }
        phaseTimes['Assert file not found'] = Date.now() - phaseStart;
        return;
      }

      // Phase 1.3
      phaseStart = Date.now();
      await t.expect(fileItem.exists).ok(`Expected file "${fileName}" to be found, but it was not.`);
      await openFilePage.clickItem(fileName);
      await openFilePage.clearCache(fileName);
      await t.wait(1000);
      phaseTimes['Open & clear cache'] = Date.now() - phaseStart - 1000;

      // Phase 1.4
      phaseStart = Date.now();
      const selectedFile = openFilePage.getSelectedFileByName(fileName);
      await t.expect(selectedFile.exists).ok(`File "${fileName}" is not selected or not displayed in selected list`);
      phaseTimes['Check selected file'] = Date.now() - phaseStart;

      // Phase 2
      phaseStart = Date.now();
      await openFilePage.clickViewButton();
      await openFilePage.waitForUrlToChange('/main?AUTHCODE');
      const currentUrl = await getLocation();
      await t.expect(currentUrl).contains('/main?AUTHCODE', 'URL is not correct after click View');
      phaseTimes['View file & check URL'] = Date.now() - phaseStart;

      // Phase 3
      phaseStart = Date.now();
      await t.expect(viewFilePage.viewFileLoading.exists).ok({ timeout: 20000 });
      await t.expect(viewFilePage.viewFileLoading.exists).notOk({ timeout: 20000 });
      const fileNameInView = await viewFilePage.getFileName();
      await t.expect(fileNameInView).contains(fileName, `File name is not correct in View Page`);
      phaseTimes['Check file in View Page'] = Date.now() - phaseStart;
    } catch (error) {
      console.error(`❌ Test failed for "${fileName}":`, error.message);

      // Danh sách tất cả phase cố định
      const allPhases = [
        'Wait for loading',
        'Search file',
        'Assert file not found',
        'Open & clear cache',
        'Check selected file',
        'View file & check URL',
        'Check file in View Page'
      ];

      // Gán "FAIL" cho các phase chưa có
      for (const phase of allPhases) {
        if (!(phase in phaseTimes)) {
          phaseTimes[phase] = 'FAIL';
        }
      }
    } finally {
      const totalTime = Date.now() - startTime;
      if (!('Total' in phaseTimes)) {
        phaseTimes['Total'] = typeof totalTime === 'number' ? totalTime : 'FAIL';
      }
      logTimeToExcel(fileName, phaseTimes);
    }
  });
});
    
