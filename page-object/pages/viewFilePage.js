import { Selector, t } from 'testcafe';

export default class ViewFilePage {
  constructor() {
    this.fileName = Selector('.custom-center-top-button .content-top-button');
  }

  async getFileName() {
    return await this.fileName.innerText;
  }

  async waitForRealFileName(timeout = 10000) {
    const start = Date.now();
    let currentName = await this.getFileName();
  
    while (currentName === 'File name' && (Date.now() - start) < timeout) {
      await t.wait(300); // chờ 300ms rồi kiểm tra lại
      currentName = await this.getFileName();
    }
  
    if (currentName === 'File name') {
      throw new Error(`⏰ Timeout ${timeout}ms: Tên file vẫn là "File name" (chưa được load)`);
    }
  
    return currentName;
  }

}
