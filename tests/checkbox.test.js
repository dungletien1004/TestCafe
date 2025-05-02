import { Selector } from 'testcafe';

fixture('Checkbox Test')
    .page('https://demoqa.com/checkbox');

test('User can expand and select checkbox', async t => {
    const expandAllButton = Selector('.rct-option-expand-all');
    const documentsCheckbox = Selector('span.rct-title').withText('Documents');
    const resultText = Selector('#result');
    await t
        .click(expandAllButton)
        .click(documentsCheckbox);

    await t.expect(resultText.innerText).contains('documents');
});
