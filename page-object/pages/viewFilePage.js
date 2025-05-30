import { Selector, t } from 'testcafe';

export default class ViewFilePage {
  constructor() {
    this.fileName = Selector('.custom-center-top-button .content-top-button');
    this.viewFileLoading = Selector('.background-loading');

  }

  async getFileName() {
    return await this.fileName.innerText;
  }

  async waitForLoadingToFinish(timeout = 20000) {
    let appeared = await this.viewFileLoading.exists;

    if (appeared) {
        // if it has appeared → wait for it to disappear
        await t.expect(this.viewFileLoading.exists).notOk({ timeout });
    } else {
        // if it has not appeared → wait for 500ms then check again
        await t.wait(500);
        appeared = await this.viewFileLoading.exists;

        if (appeared) {
            // after waiting, if it has appeared → wait for it to disappear
            await t.expect(this.viewFileLoading.exists).notOk({ timeout });
        } else {
            // after waiting, if it has not appeared → ok
            await t.expect(this.viewFileLoading.exists).notOk({ timeout });
        }
    }
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
