import { Selector } from "testcafe";

fixture("Login test").page("https://the-internet.herokuapp.com/login");

test("Invalid login", async (t) => {
    const usernameInput = Selector("#username");
    const passwordInput = Selector("#password");
    const submitButton = Selector("button[type='submit']");
    const errorMessage = Selector("#flash");

    await t
        .typeText(usernameInput, "invalidUser")
        .typeText(passwordInput, "invalidPass")
        .click(submitButton)
        .expect(errorMessage.innerText)
        .contains("Your username is invalid!");
});

test("Valid login", async (t) => {
    const usernameInput = Selector("#username");
    const passwordInput = Selector("#password");
    const submitButton = Selector("button[type='submit']");
    const successMessage = Selector("#flash");
    const logoutButton = Selector(".example > a");
    await t
        .typeText(usernameInput, "tomsmith")
        .typeText(passwordInput, "SuperSecretPassword!")
        .click(submitButton)
        .expect(successMessage.innerText)
        .contains("You logged into a secure area!")
        .expect(logoutButton.exists).ok()
        .expect(usernameInput.exists).notOk()
        .expect(passwordInput.exists).notOk()
        .click(logoutButton)
        .expect(successMessage.innerText)
        .contains("You logged out of the secure area!");
});
