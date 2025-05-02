import { Selector } from "testcafe";

fixture `Basic Test`
    .page `https://devexpress.github.io/testcafe/example`
    .beforeEach(async (t) => {
    })
    .before(async () => {
    })
    .afterEach(async (t) => {
    })
    .after(async () => {
    });

test("My first test", async (t) => {
    const developerName = Selector("#developer-name");
    const submitButton = Selector("#submit-button");
    const articleText = Selector("#article-header").innerText;

    await t
        .takeElementScreenshot(developerName)
        .typeText(developerName, "John Smith")
        .click(submitButton)
        .expect(articleText).eql("Thank you, John Smith!");
});

