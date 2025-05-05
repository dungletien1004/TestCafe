import OpenFilePage from '../page-object/pages/openFilePage';
import ViewFilePage from '../page-object/pages/viewFilePage';
import { ClientFunction } from 'testcafe';
import { readFileNamesFromExcel, readFileNameFromJsonFile } from '../utils';
const getLocation = ClientFunction(() => window.location.href);
const openFilePage = new OpenFilePage();
const viewFilePage = new ViewFilePage();


// const fileNamesPositive = readFileNamesFromExcel('test-data/fileName-Positive.xlsx');
// const fileNamesNegative = readFileNamesFromExcel('test-data/fileName-Negative.xlsx');

const fileNames: { fileName: string, expect: boolean }[] = readFileNameFromJsonFile('test-data/fileNames.json');
fixture `Open file R2.3dviewer`
    .page`http://r2.3dviewer.anybim.vn/autoTest`;


fileNames.forEach((item) => {
  test(`${item.expect ? 'Should open' : 'Should not find'} file: ${item.fileName}`, async t => {
    const fileName = item.fileName;
    // wait for loading max 5s
    await t.expect(openFilePage.backgroundLoading.exists).ok({ timeout: 5000 });

    // wait for loading disappear max 10s
    await t.expect(openFilePage.backgroundLoading.exists).notOk({ timeout: 10000 });
    // 1. search for file
    await openFilePage.searchForFile(fileName);

    await t.wait(2000);

    // 2. check file found and click first file (found result)
    const fileItem = openFilePage.getItem(0);

    // ✅ If expect = false, assert the file should not be found and skip the rest
    if (!item.expect) {
      await t.expect(fileItem.exists).notOk(`File "${fileName}" should NOT be found`);
      return;
    }

    // ✅ Expect = true: proceed to open and validate the file
    await t.expect(fileItem.exists).ok(`File "${fileName}" should exist but was NOT found`);

    await openFilePage.clickItem(t, 0);

    await t.wait(1000);
    // 3. check file name in selected list
    const selectedFile = openFilePage.getSelectedFileByName(fileName);
    await t
      .expect(selectedFile.exists)
      .ok(`File "${fileName}" is not selected or not displayed in selected list`);

    // 4. click view button
    await openFilePage.clickViewButton();
    // 5. wait for caching file
    await openFilePage.waitForUrlToChange('/main?AUTHCODE');

    // 6. check new url
    const currentUrl = await getLocation();
    await t.expect(currentUrl).contains('/main?AUTHCODE', 'URL is not correct after click View');

    // 7. check file name in view page
    await viewFilePage.waitForRealFileName();
    const fileNameInView = await viewFilePage.getFileName();
    await t.expect(fileNameInView).contains(fileName, `File name is not correct in View Page, fileNameInView: ${fileNameInView}`);
  });
})
