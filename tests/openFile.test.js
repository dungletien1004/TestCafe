import OpenFilePage from '../page-object/pages/openFilePage';
import ViewFilePage from '../page-object/pages/viewFilePage';
import { ClientFunction } from 'testcafe';
import { readFileNamesFromExcel } from '../utils/readFileExcel';

const getLocation = ClientFunction(() => window.location.href);
const openFilePage = new OpenFilePage();
const viewFilePage = new ViewFilePage();


// Đọc file Excel (ví dụ: test-data/fileName-Positive.xlsx)
const fileNamesPositive = readFileNamesFromExcel('test-data/fileName-Positive.xlsx');
const fileNamesNegative = readFileNamesFromExcel('test-data/fileName-Negative.xlsx');

fixture `Open file R2.3dviewer`
    .page`http://r2.3dviewer.anybim.vn/autoTest`;


fileNamesPositive.forEach(fileName => {
  test(`Open file Positive ${fileName}`, async t => {
    // await t.wait(5000);
    // Chờ loading xuất hiện (nếu có), tối đa 5 giây
    await t.expect(openFilePage.backgroundLoading.exists).ok({ timeout: 5000 });

    // Sau đó đợi nó biến mất, tối đa 10 giây
    await t.expect(openFilePage.backgroundLoading.exists).notOk({ timeout: 10000 });
    // await t.expect(openFilePage.backgroundLoading.exists).notOk();
    // 1. Tìm kiếm file
    await openFilePage.searchForFile(fileName);

    await t.wait(2000);

    // 2. Click vào file đầu tiên (kết quả tìm được)
    await openFilePage.clickItem(t, 0);

    await t.wait(1000);
    // 3. Kiểm tra tên file có nằm trong danh sách đã chọn
    const selectedFile = openFilePage.getSelectedFileByName(fileName);
    await t
      .expect(selectedFile.exists)
      .ok(`File "${fileName}" chưa được chọn hoặc không hiển thị trong danh sách đã chọn`);

    // 4. Click nút View
    await openFilePage.clickViewButton();
    // 5. Đợi caching file
    await openFilePage.waitForUrlToChange('/main?AUTHCODE');

    // 6. Kiểm tra URL mới
    const currentUrl = await getLocation();
    await t.expect(currentUrl).contains('/main?AUTHCODE', 'URL không đúng sau khi click View');

    // 7. Kiểm tra tên file trong View Page
    await viewFilePage.waitForRealFileName();
    const fileNameInView = await viewFilePage.getFileName();
    await t.expect(fileNameInView).contains(fileName, `Tên file không đúng trong View Page, fileNameInView: ${fileNameInView}`);
  });
})

fileNamesNegative.forEach(fileName => {
  test(`Open file Negative ${fileName}`, async t => {
    // Chờ loading xuất hiện (nếu có), tối đa 5 giây
    await t.expect(openFilePage.backgroundLoading.exists).ok({ timeout: 5000 });

    // Sau đó đợi nó biến mất, tối đa 10 giây
    await t.expect(openFilePage.backgroundLoading.exists).notOk({ timeout: 10000 });
    // 1. Tìm kiếm file
    await openFilePage.searchForFile(fileName);
    await t.wait(5000);
    // 2. Kiểm tra có file nào không 
    const fileItem = openFilePage.getItem(0);
    await t.expect(fileItem.exists).notOk('Không có file nào được tìm thấy');
  });
})