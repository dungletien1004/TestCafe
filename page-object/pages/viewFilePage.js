import { Selector, t } from 'testcafe';

export default class ViewFilePage {
  constructor() {
    this.fileName = Selector('.custom-center-top-button .content-top-button');
    this.viewFileLoading = Selector('.background-loading');

  }

  async getFileName() {
    return await this.fileName.innerText;
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

}
