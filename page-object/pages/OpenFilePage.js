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
        // Nút "View" nằm trong <mat-card-footer> bên trong vùng selected
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

     // Kiểm tra xem có file nào được chọn
    async isAnyFileSelected() {
        return this.selectedFilenames.count > 0;
    }

    // Kiểm tra xem một file cụ thể đã được chọn chưa
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
    //         message: `URL không chứa "${expectedPart}" sau ${timeout}ms`
    //     });
    // }

    async waitForUrlToChange(expectedPart, timeout = 10000) {
        const start = Date.now();
    
        while ((Date.now() - start) < timeout) {
            const currentUrl = await getLocation();
            const status = await this.getStatus();
    
            // Nếu thấy lỗi thì fail ngay
            if (status === 'Error') {
                throw new Error(`❌ Caching error`);
            }
    
            // Nếu URL chứa đoạn cần thiết → pass
            if (currentUrl.includes(expectedPart)) {
                return;
            }
    
            await t.wait(500); // chờ một chút rồi kiểm tra lại
        }
    
        // Nếu sau timeout vẫn không có URL mong muốn → fail
        throw new Error(`⏰ Hết ${timeout}ms nhưng URL không chứa "${expectedPart}"`);
    }
}
