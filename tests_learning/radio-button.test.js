import { Selector } from 'testcafe';

fixture('Radio Button Test')
    .page('https://demoqa.com/radio-button');

test('User can select Yes radio button', async t => {
    const yesRadioButton = Selector('label[for="yesRadio"]');
    const successMessage = Selector('.text-success');
    await t
        .click(yesRadioButton);

    await t.expect(successMessage.innerText).eql('Yes');
});
