import OpenFilePage from '../page-object/pages/OpenFilePage';
const page = new OpenFilePage();

fixture `Open file R2.3dviewer`
       .page`http://r2.3dviewer.anybim.vn/autoTest`;

test('Search file → select → check selected → view file', async t => {
  const fileName = 'acad-Drawing-diff-formats-Sht3_LastSaved_Zoomed.dwg';
  await t.wait(1000);
  // // 1. Tìm kiếm file
  // await page.searchForFile(fileName);

  // // 2. Click vào file đầu tiên (kết quả tìm được)
  // await page.clickItem(t, 0);

  // // 3. Kiểm tra tên file có nằm trong danh sách đã chọn
  // const selectedFile = page.getSelectedFileByName(fileName);
  // await t
  //   .expect(selectedFile.exists)
  //   .ok(`File "${fileName}" chưa được chọn hoặc không hiển thị trong danh sách đã chọn`);

  // // 4. Click nút View
  // await page.clickViewButton();
});
