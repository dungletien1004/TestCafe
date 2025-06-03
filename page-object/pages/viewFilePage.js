import { Selector, t } from 'testcafe';

export default class ViewFilePage {
  constructor() {
    this.fileName = Selector('.custom-center-top-button .content-top-button');
    this.viewFileLoading = Selector('.background-loading');
    this.ContentPanelButton = Selector('section.container-menu app-button-custom').nth(2);
  }

  async getFileName() {
    const hasFileName = await this.fileName.exists;

    if (!hasFileName) {
      return null;
    }
    return await this.fileName.innerText;
  }

  async waitForLoadingToFinish(timeout = 20000) {
    const fileNameInView = await this.getFileName();
    if (fileNameInView !== 'File name' && fileNameInView !== null) {
      return;
    }
    await t.expect(this.viewFileLoading.exists).ok({ timeout });
    await t.expect(this.viewFileLoading.exists).notOk({ timeout });
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

}
