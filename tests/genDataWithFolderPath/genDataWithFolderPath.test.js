import { logFileInfo, readFileNameFromJsonFile, resetJsonFile } from '../../utils';
import openPage from '../../page-object/pages/openPage';

const openFilePage = new openPage();

const folderPaths = readFileNameFromJsonFile('test-data/data-folder/data-folder.json');
const fileLogPath = 'test-data/data-file/';

fixture `Gen data with folder path`
    // .page`http://localhost:4200/autoTest`
    .page`http://r2.3dviewer.anybim.vn/autoTest`;
    // .page`http://dev-test:4200/autoTest`;

  folderPaths.forEach((item) => {
    test(`Gen data with folder path: ${item.folderPath}`, async t => {
      const thread = item.thread || 1;
      const folderPath = item.folderPath;
      const fileName = `${fileLogPath}data-file-${thread}.json`;
      resetJsonFile(fileName);
        try {
          await openFilePage.waitForLoadingToFinish();
          await openFilePage.genDataWithFolderPath(folderPath, logFileInfo, fileName);
        } catch (error) {
          const errorMessage = error.message || error.toString();
          console.error(`❌ Test failed for "${fileName}":`, errorMessage);
          console.log(`Error: ${error}`);
        }

    });
  });
