import { Selector } from 'testcafe';

fixture('Buttons Test')
    .page('https://demoqa.com/buttons');

test('User can double click and right click', async t => {
    const doubleClickBtn = Selector('#doubleClickBtn');
    const rightClickBtn = Selector('#rightClickBtn');
    const doubleClickMessage = Selector('#doubleClickMessage');
    const rightClickMessage = Selector('#rightClickMessage');
    await t
        .doubleClick(doubleClickBtn)
        .rightClick(rightClickBtn);

    await t.expect(doubleClickMessage.innerText).contains('You have done a double click');
    await t.expect(rightClickMessage.innerText).contains('You have done a right click');
});
