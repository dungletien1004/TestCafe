import { Selector, t } from "testcafe";

export default class OpenFilePage {
    constructor() {
        this.search = Selector('#search');
        this.item = Selector('mat-list-item');
        this.selectedListContainer = Selector('.selected-file-lists');
        this.selectedFilenames = this.selectedListContainer.find('.filename');
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
}
