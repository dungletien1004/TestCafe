import { Selector, t, ClientFunction } from "testcafe";

const getLocation = ClientFunction(() => window.location.href);

export default class OpenFilePage {
    constructor() {
        this.backgroundLoading = Selector('.background-loading');
        this.search = Selector('#search');
        this.item = Selector('mat-list-item');
        this.selectedListContainer = Selector('.selected-file-lists');
        this.selectedFilenames = this.selectedListContainer.find('.filename');
        this.statusContainer = Selector('.status-contain');
        this.statusText = this.statusContainer.find('span');
        // "View" button is in <mat-card-footer> inside selected area
        this.viewButton = this.selectedListContainer.find('mat-card-footer button').withText('View');
    }

    async searchForFile(fileName) {
        await t.typeText(this.search, fileName);
    }

    getItem(index) {
        return this.item.nth(index);
    }

    getFilename(index) {
        return this.getItem(index).find('.filename');
    }
    

    async clickItem(t, index = 0) {
        await t.click(this.getItem(index));
    }

    async checkFileNameSelected(t, index = 0) {
        await t.expect(this.getFilename(index).exists).ok();
    }

    // Check if any file is selected
    async isAnyFileSelected() {
        return this.selectedFilenames.count > 0;
    }

    // Check if a specific file is selected
    getSelectedFileByName(name) {
        return this.selectedFilenames.withText(name);
    }

    async clickViewButton() {
        await t.click(this.viewButton);
    }

    async getStatus() {
        const isVisible = await this.statusText.exists;
        return isVisible ? (await this.statusText.innerText).trim() : null;
    }

    // async waitForUrlToChange(expectedPart, timeout = 100000) {
    //     await t.expect(getLocation()).contains(expectedPart, {
    //         timeout,
    //         message: `URL not contains "${expectedPart}" after ${timeout}ms`
    //     });
    // }

    async waitForUrlToChange(expectedPart, timeout = 10000) {
        const start = Date.now();
    
        while ((Date.now() - start) < timeout) {
            const currentUrl = await getLocation();
            const status = await this.getStatus();
    
            // If found error, fail immediately
            if (status === 'Error') {
                throw new Error(`❌ Caching error`);
            }
    
            // If URL contains the expected part → pass
            if (currentUrl.includes(expectedPart)) {
                return;
            }
    
            await t.wait(500); // wait a moment then check again
        }
    
        // If after timeout, URL is not the expected part → fail
        throw new Error(`⏰ Timeout ${timeout}ms but URL not contains "${expectedPart}"`);
    }
}
