import { openPage, ViewFilePage } from '../page-object/pages'
import { ClientFunction } from 'testcafe';
import { readFileNameFromJsonFile } from '../utils';

const getLocation = ClientFunction(() => window.location.href);
const openFilePage = new openPage();
const viewFilePage = new ViewFilePage();


// const fileNamesPositive = readFileNamesFromExcel('test-data/fileName-Positive.xlsx');
// const fileNamesNegative = readFileNamesFromExcel('test-data/fileName-Negative.xlsx');

const fileNames = readFileNameFromJsonFile('test-data/fileNames.json');
fixture `Open file R2.3dviewer`
    .page`http://r2.3dviewer.anybim.vn/autoTest`;


fileNames.forEach((item) => {
  test(`${item.expect ? 'Should open' : 'Should not find'} file: ${item.fileName}`, async t => {
    const fileName = item.fileName;
    // wait for loading max 5s
    await t.expect(openFilePage.backgroundLoading.exists).ok({ timeout: 20000 });

    // wait for loading disappear max 10s
    await t.expect(openFilePage.backgroundLoading.exists).notOk({ timeout: 20000 });
    // 1. search for file
    await openFilePage.searchForFile(fileName);

    const searchText = await openFilePage.getSearchText();

    console.log(`searchText: ${searchText}`);

    await t.wait(2000);

    // 2. check file found and click first file (found result)
    const fileItem = await openFilePage.getItem(fileName);

    // ✅ If expect = false, assert the file should not be found and skip the rest
    if (!item.expect) {
      if (fileItem) {
        await t.expect(fileItem.exists).notOk(`File "${fileName}" was found but should NOT exist in search results`);
      }
      return;
    }

    // ✅ Expect = true: proceed to open and validate the file
    await t.expect(fileItem.exists).ok(`Expected file "${fileName}" to be found, but it was not.`);

    await openFilePage.clickItem(fileName);
    // ✅ Clear cache
    await openFilePage.clearCache(fileName);

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
    console.log(`new url view file ${fileName}: ${currentUrl}`);
    await t.expect(currentUrl).contains('/main?AUTHCODE', 'URL is not correct after click View');

    // 7. check file name in view page
    await viewFilePage.waitForRealFileName(60000);
    const fileNameInView = await viewFilePage.getFileName();
    await t.expect(fileNameInView).contains(fileName, `File name is not correct in View Page, fileNameInView: ${fileNameInView}`);
  });
})
