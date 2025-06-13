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
        this.leftContent = Selector('.left-content');
        this.dialog = Selector('.left-div');
        this.okBtn = this.dialog.find('button').withText('OK');
        this.fullPathSelector = Selector('.relativepath').find('.text');
    }

    async searchForFile(fileName) {
        await t.typeText(this.search, fileName);
    }

    async searchFunc(selector, input) {
        await t.typeText(selector, input);
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

    async getFolder(folderName) {
        const itemCount = await this.item.count;
        for (let i = 0; i < itemCount; i++) {
            const item = this.item.nth(i);
            const text = await item.find('.filename').innerText;
            const folderIcon = await this.leftContent.find('mat-icon').innerText;
            if (!folderIcon || folderIcon !== 'folder_open') {
                console.log(`❌ Folder "${folderName}" is not found`);
            }
            if (text.trim() === folderName.trim()) {
                console.log(`✅ Find folder ${folderName}`);
                return item;
            }
        }
    
        return null;
    }

    

    async clickItem(item) {
        await t.click(item);
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

    async waitForUrlToChange(expectedPart, fileItem, timeout = 240000) {
        const start = Date.now();
    
        while ((Date.now() - start) < timeout) {
            const currentUrl = await getLocation();
            // If URL contains the expected part → pass
            if (currentUrl.includes(expectedPart)) {
                return;
            }
            let status;
            try{
                status = await fileItem.find('.main-content-cache span').innerText;
            } catch(e) {}
            // If found error, fail immediately
            if (status === 'Error') {
                throw new Error(`❌ Caching error`);
            }
            await t.wait(500); // wait a moment then check again
        }
    
        // If after timeout, URL is not the expected part → fail
        throw new Error(`⏰ Timeout ${timeout}ms but URL not contains "${expectedPart}"`);
    }

    async clearCache(item) {
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

    async getFileSize(item) {
        const size = await item.find('.right-size span').innerText;
        return size.trim();
    }

    async getFullPath() {
        const count = await this.fullPathSelector.count;
        let fullPath = '';

        for (let i = 0; i < count; i++) {
            const text = await this.fullPathSelector.nth(i).innerText;
            if (i > 0) fullPath += '/';
            fullPath += text.trim();
        }
        return fullPath;
    }

    async moveToFolder(folderPath) {
        const pathArray = folderPath.replace('./', '').split('/');
        console.log('pathArray', pathArray);
        let currentPath = 'Root';
        for (const path of pathArray) {
            await t.typeText(this.search, path, { replace: true });
            await t.wait(1000);
            const folder = await this.getFolder(path);
            
            if (folder) {
                console.log(`click folder ${path}`)
                await t.click(folder);
                currentPath += `/${path}`;
                await t.wait(1000);
            } else {
                throw new Error(`Path: ${folderPath} not found`);
            }
        }

        return currentPath;
    }

    async genDataWithFolderPath(folderPath, logFileInfo, fileLogPath) {
        try {
            const pathTest = await this.moveToFolder(folderPath);
            const itemCount = await this.item.count;
            const fullPath = await this.getFullPath()
            if (pathTest !== fullPath) {
                console.log('error: pathTest !== fullPath', pathTest !== fullPath)
                console.log('error: pathTest', pathTest)
                console.log('error: fullPath', fullPath)
                return ;
            }
            let count = 0;
            for (let i = 0; i < itemCount; i++) {
                const item = this.item.nth(i);
                const text = await item.find('.filename').innerText;
                const extension = text.split('.').pop();
                const folderIcon = await item.find('mat-icon').innerText;
                if (folderIcon === 'folder_open') {
                    continue;
                }
                let fileInfo = {
                    fileName: text,
                    path: folderPath,
                    expectFileFound: true
                }
                if (extension === 'purged') {
                    continue;
                }
                if (extension === 'dwg' || extension === 'dgn') {
                    fileInfo.isHoop = true;
                    fileInfo.sheetNames = ['2D Model', 'Model'];
                }
                console.log(`log data fileName: ${text}`);
                count++;
                logFileInfo(fileLogPath, fileInfo);
            }
            console.log(`Input ${count} file from folder path ${folderPath}`);
        } catch (error) {
            console.log(`genDataWithFolderPath Error: ${error}`);
        }
    }
}
