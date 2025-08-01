import { Selector, t } from 'testcafe';
import { logValueToExcel } from '../../utils';

export default class ViewFilePage {
  constructor() {
    this.fileName = Selector('.custom-center-top-button .content-top-button');
    this.viewFileLoading = Selector('.background-loading');
    this.ContentPanelButton = Selector('section.container-menu app-button-custom').nth(2);
    this.sheetItem = Selector('app-sheets .sheet-item');
    this.markupToolbarParent = Selector('.markup-toolbar-parent');
    this.publishPDFButton = Selector('app-button-custom[icon="publishPDF"]');
    this.savePDFButton = Selector('button[mat-flat-button]').withText('Save PDF');
    this.dialogWaiting = Selector('app-dialog-waiting');
  }

  async getFileName() {
    const hasFileName = await this.fileName.exists;

    if (!hasFileName) {
      return null;
    }
    return await this.fileName.innerText;
  }

  async waitForLoadingToFinish(timeout = 60000) {
    await t.expect(this.markupToolbarParent.exists).ok(`❌ markupToolbarParent not found after timeout (${timeout}ms)`, { timeout });
  }

  async waitForRealFileName(timeout = 10000) {
    const start = Date.now();
    let currentName = await this.getFileName();
  
    while (currentName === 'File name' && (Date.now() - start) < timeout) {
      await t.wait(300); // wait 300ms then check again
      currentName = await this.getFileName();
    }
  
    if (currentName === 'File name') {
      throw new Error(`⏰ Timeout ${timeout}ms: The file name is still not visible on the screen.`);
    }
  
    return currentName;
  }

  async clickContentPanelButton() {
    await t.click(this.ContentPanelButton);
  }

  async checkSheetItemNames(item, logValueToExcel, fileExcelName) {
    const expectedNames = item.sheetNames;
    const sheetItems = this.sheetItem.find('.content-sheet span');

    const actualNames = [];
    const count = await sheetItems.count;
    for (let i = 0; i < count; i++) {
        const name = (await sheetItems.nth(i).innerText).trim();
        actualNames.push(name);
    }

    for (const expectedName of expectedNames) {
        if (!actualNames.includes(expectedName)) {
          console.log(`❌ Sheet item "${expectedName}" is NOT found in the actual list: [${actualNames.join(', ')}]`);
          logValueToExcel(item.fileName, 'Error', `❌ Sheet item "${expectedName}" is NOT found in the actual list: [${actualNames.join(', ')}]`, fileExcelName)
        }
    }
  }

  async clickSheetItem(sheetName, fileName, fileExcelName, timeout = 60000) { // max timeout 60s
    const count = await this.sheetItem.count;
    let found = false;

    for (let i = 0; i < count; i++) {
        const item = this.sheetItem.nth(i);
        const span = item.find('.content-sheet span').with({ visibilityCheck: true });
        const name = (await span.innerText).trim();
        if (name === sheetName) {
            const className = await item.getAttribute('class');

            if (className.includes('sheet-item-active')) {
                logValueToExcel(fileName, `Open sheet: ${sheetName}`, 'Default sheet on file open', fileExcelName);
            } else {
                const timeClick = Date.now();
                await t.click(item);
                await t
                    .expect(item.getAttribute('class'))
                    .contains('sheet-item-active', `❌ "${sheetName}" does not have 'sheet-item-active' class after click`, { timeout });

                const markupToolbarParent = Selector('.markup-toolbar-parent');
                if (!markupToolbarParent.exists) {
                    await t.expect(this.viewFileLoading.exists).ok({ timeout });
                    await t.expect(this.viewFileLoading.exists).notOk({ timeout });
                }
                logValueToExcel(fileName, `Open sheet: ${sheetName} (s)`, (Date.now() - timeClick) / 1000, fileExcelName );
            }

            found = true;
            break;
        }
    }
}

  async clickPublishPDFButton() {
    await t.click(this.publishPDFButton);
  }

  async clickSavePDFButton() {
    await t.click(this.savePDFButton);
  }

  async waitForDialogLoadingToFinish(timeout = 1800000) { // 30 minutes = 1800000ms
    await t.expect(this.dialogWaiting.exists).notOk(`❌ Dialog loading still exists after timeout (${timeout}ms)`, { timeout });
  }

  async publishPDF(fileName, fileExcelName) {
    const phaseStart = Date.now();
    await this.clickPublishPDFButton();
    await this.clickSavePDFButton();
    console.log('Waiting for publish PDF to finish');
    await this.waitForDialogLoadingToFinish();
    console.log('Publish PDF: ' + (Date.now() - phaseStart) / 1000, ' s');
    logValueToExcel(fileName, 'Publish PDF', (Date.now() - phaseStart) / 1000, fileExcelName);
  }

}
