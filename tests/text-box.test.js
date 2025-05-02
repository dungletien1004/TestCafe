import TextBox from '../page-object/components/TextBox';
const textBox = new TextBox();

fixture('Text Box Form Test')
    .page('https://demoqa.com/text-box');

test.only('User can fill and submit text box form', async t => {
    await textBox.fillFormAndSubmit({
        userName: 'dung',
        userEmail: 'dung@example.com',
        currentAddress: 'hicas',
        permanentAddress: '86/59 PQ'
    });

    await t.expect(textBox.nameResult.innerText).contains('dung');
    await t.expect(textBox.emailResult.innerText).contains('dung@example.com');
    await t.expect(textBox.currentAddressResult.innerText).contains('hicas');
    await t.expect(textBox.permanentAddressResult.innerText).contains('86/59 PQ');
});
