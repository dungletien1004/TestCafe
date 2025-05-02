import { Selector, t } from "testcafe";

export default class TextBox     {
    constructor() {
        // Form-Input
        this.userName = Selector('#userName');
        this.userEmail = Selector('#userEmail');
        this.currentAddress = Selector('#currentAddress');
        this.permanentAddress = Selector('#permanentAddress');
        this.submitButton = Selector('#submit');
        // Form-Output
        this.output = Selector('#output');
        this.nameResult = Selector('#name');
        this.emailResult = Selector('#email');
        this.currentAddressResult = Selector('#output #currentAddress');
        this.permanentAddressResult = Selector('#output #permanentAddress');
    }
    // Fill form and submit
    async fillFormAndSubmit({userName, userEmail, currentAddress, permanentAddress}) {
        await t
            .typeText(this.userName, userName, { paste: true , replace: true})
            .typeText(this.userEmail, userEmail, { paste: true , replace: true})
            .typeText(this.currentAddress, currentAddress, { paste: true , replace: true})
            .typeText(this.permanentAddress, permanentAddress, { paste: true , replace: true})
            .click(this.submitButton)
    }
}
