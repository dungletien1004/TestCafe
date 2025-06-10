import { logFileInfo, readFileNameFromJsonFile, resetJsonFile } from '../../utils';
import openPage from '../../page-object/pages/openPage';

const openFilePage = new openPage();

const folderPaths = readFileNameFromJsonFile('test-data/data-folder/data-folder.json');
const fileLogPath = 'test-data/data-file/data-file.json';
resetJsonFile(fileLogPath);

fixture `Gen data with folder path`
    // .page`http://localhost:4200/autoTest`
    .page`http://r2.3dviewer.anybim.vn/autoTest`;
    // .page`http://dev-test:4200/autoTest`;

  folderPaths.forEach((item) => {
    test(`Gen data with folder path: ${item.folderPath}`, async t => {
      const folderPath = item.folderPath;
        try {
          await openFilePage.waitForLoadingToFinish();
          await openFilePage.genDataWithFolderPath(folderPath, logFileInfo, fileLogPath);
        } catch (error) {
          const errorMessage = error.message || error.toString();
          console.error(`❌ Test failed for "${fileName}":`, errorMessage);
          console.log(`Error: ${error}`);
        }

    });
  });
