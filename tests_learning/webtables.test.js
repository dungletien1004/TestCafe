import { Selector } from 'testcafe';

fixture('Web Tables Test')
    .page('https://demoqa.com/webtables');

test('User can add a new record', async t => {
    const addNewRecordButton = Selector('#addNewRecordButton');
    const firstName = Selector('#firstName');
    const lastName = Selector('#lastName');
    const userEmail = Selector('#userEmail');
    const age = Selector('#age');
    const salary = Selector('#salary');
    const department = Selector('#department');
    const submitButton = Selector('#submit');
    await t
        .click(addNewRecordButton)
        .typeText(firstName, 'John', { paste: true , replace: true})
        .typeText(lastName, 'Lee', { paste: true , replace: true})
        .typeText(userEmail, 'john.lee@example.com', { paste: true , replace: true})
        .typeText(age, '30', { paste: true , replace: true})
        .typeText(salary, '50000', { paste: true , replace: true})
        .typeText(department, 'Engineering', { paste: true , replace: true})
        .click(submitButton);

    await t.expect(Selector('.rt-td').withText('John').exists).ok();
});
