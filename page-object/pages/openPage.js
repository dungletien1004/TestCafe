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
        this.menuContextUpdate = Selector('.mat-mdc-menu-content');

        this.dialog = Selector('.left-div');
        this.okBtn = this.dialog.find('button').withText('OK');
    }

    async searchForFile(fileName) {
        await t.typeText(this.search, fileName);
    }

    async getSearchText() {
        return this.search.value;
    }

    async getItem(fileName, path) {
        const itemCount = await this.item.count;
        let hasFoundFileName = false;
    
        for (let i = 0; i < itemCount; i++) {
            const item = this.item.nth(i);
            const text = await item.find('.filename').innerText;
            const pathText = await item.find('.path').innerText;
    
            if (text.trim() === fileName.trim()) {
                hasFoundFileName = true;
    
                // If path is not provided, return the first item matching fileName
                if (!path) {
                    return item;
                }
    
                if (pathText.trim() === path.trim()) {
                    return item;
                }
            }
        }
    
        if (hasFoundFileName) {
            throw new Error(`File "${fileName}" found but path: "${path}" is not correct`);
        }
    
        return null;
    }

    

    async clickItem(fileName, path) {
        const item = await this.getItem(fileName, path);
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

    async getStatus(expectedPart = '') {
        const element = this.statusText;
        const exists = await element.exists;
        const visible = await element.visible;
        const currentUrl = await getLocation();
        if (currentUrl.includes(expectedPart)) {
            return null;
        }
        if (exists && visible) {
            const text = await element.innerText;
            return text.trim();
        }
    
        return null;
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
            // If URL contains the expected part → pass
            if (currentUrl.includes(expectedPart)) {
                return;
            }
            const status = await this.getStatus(expectedPart);
    
            // If found error, fail immediately
            if (status === 'Error') {
                throw new Error(`❌ Caching error`);
            }
            await t.wait(500); // wait a moment then check again
        }
    
        // If after timeout, URL is not the expected part → fail
        throw new Error(`⏰ Timeout ${timeout}ms but URL not contains "${expectedPart}"`);
    }

    async clearCache(fileName, path) {
        const item = await this.getItem(fileName, path);
        if (!item) {
            throw new Error(`File "${fileName}" not found`);
        }
    
        await t.rightClick(item);
    
        // Kiểm tra context menu nào tồn tại
        let menuContext = this.menuContext;
        if (!(await menuContext.exists)) {
            menuContext = this.menuContextUpdate;
        }
        const clearCacheBtn = menuContext.find('button').withText('Clear cache');
        await t.expect(menuContext.exists).ok('Menu context is not visible');
        await t.click(clearCacheBtn);
        await t.expect(this.dialog.exists).ok('Dialog is not visible');
        await t.click(this.okBtn);
    }

    async waitForLoadingToFinish(timeout = 20000) {
        const searchBox = this.search;
        const hasSearchBox = await searchBox.exists;
        // Step 1: Wait for loading to appear only if search box is not present
        if (!hasSearchBox) {
            await t.expect(this.backgroundLoading.exists).ok({ timeout: 20000 });
        }
        // Step 2: Wait for loading to disappear
        if (this.backgroundLoading.exists) {
            await t.expect(this.backgroundLoading.exists).notOk({ timeout: 20000 });
        }
    }

    async getFileSize(fileName, path) {
        const item = await this.getItem(fileName, path);
        if (!item) {
            throw new Error(`File "${fileName}" not found`);
        }
        const size = await item.find('.right-size span').innerText;
        return size.trim();
    }
}
