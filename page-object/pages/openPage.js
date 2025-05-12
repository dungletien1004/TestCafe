import { Selector, t, ClientFunction } from "testcafe";

const getLocation = ClientFunction(() => window.location.href);

export default class openPage {
    constructor() {
        this.backgroundLoading = Selector('.background-loading');
        this.search = Selector('#search');
        this.item = Selector('mat-card-content mat-list-item');
        this.selectedListContainer = Selector('.selected-file-lists');
        this.selectedFilenames = this.selectedListContainer.find('.filename');
        this.statusContainer = Selector('.status-contain');
        this.statusText = this.statusContainer.find('span');
        // "View" button is in <mat-card-footer> inside selected area
        this.viewButton = this.selectedListContainer.find('mat-card-footer button').withText('View');
        this.menuContext = Selector('.mat-menu-content');
        this.clearCacheBtn = this.menuContext.find('button').withText('Clear cache');

        this.dialog = Selector('.left-div');
        this.okBtn = this.dialog.find('button').withText('OK');
    }

    async searchForFile(fileName) {
        await t.typeText(this.search, fileName);
    }

    async getSearchText() {
        return this.search.value;
    }

    async getItem(fileName) {
        const itemCount = await this.item.count;
        for (let i = 0; i < itemCount; i++) {
            const item = this.item.nth(i);
            const text = await item.find('.filename').innerText;
            if (text.trim() === fileName.trim()) {
                return item;
            }
        }
        return null;
    }

    

    async clickItem(fileName) {
        const item = await this.getItem(fileName);
        if (item) {
            await t.click(item);
        } else {
            throw new Error(`File "${fileName}" not found`);
        }
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

    async waitForUrlToChange(expectedPart, timeout = 240000) {
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

    async clearCache(fileName) {
        const item = await this.getItem(fileName);
        if (item) {
            await t.rightClick(item);
            await t.expect(this.menuContext.exists).ok('Menu context is not visible');
            await t.click(this.clearCacheBtn);
            await t.expect(this.dialog.exists).ok('Dialog is not visible');
            await t.click(this.okBtn);
        } else {
            throw new Error(`File "${fileName}" not found`);
        }
    }
}
