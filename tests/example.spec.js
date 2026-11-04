import { test, expect } from "@playwright/test";
import { LoginPage } from "./login-page.js";
import { users, invalidCredentials } from "./test-data.js";

async function expectLoginError(loginPage, expectedMessage) {
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(expectedMessage);
}

test.beforeEach(async function({ page }) {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
});

test.describe("Successful Login", function() {

test("login page displays its form", async function({ page }) {
    const loginPage = new LoginPage(page);

    await expect(page).toHaveTitle("Swag Labs");
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();

    await expect(loginPage.loginButton).toBeEnabled();

    await expect(loginPage.usernameInput).toBeEditable();
    await expect(loginPage.passwordInput).toBeEditable();

    await expect(loginPage.passwordInput).toHaveAttribute("type", "password");

    await expect(loginPage.usernameInput).toHaveValue("");
    await expect(loginPage.passwordInput).toHaveValue("");

    await expect(loginPage.usernameInput).toHaveAttribute("placeholder", "Username");
    await expect(loginPage.passwordInput).toHaveAttribute("placeholder", "Password");

    await expect(page.getByRole("textbox", { name: "Username" })).toBeVisible();

    await expect(loginPage.passwordInput).toHaveAttribute("aria-label", "Password");

});

test("login form accepts user input", async function({ page }) {
    const loginPage = new LoginPage(page);

    await loginPage.usernameInput.fill("standard_user");
    
    await expect(loginPage.usernameInput).toHaveValue("standard_user");
    await loginPage.usernameInput.clear();
    await expect(loginPage.usernameInput).toHaveValue("");

    await loginPage.passwordInput.fill("secret_sauce");
    await expect(loginPage.passwordInput).toHaveValue("secret_sauce");

    await loginPage.passwordInput.fill("new_password_123");
    await expect(loginPage.passwordInput).toHaveValue("new_password_123");
});

test("successful login navigates to products", async function({ page }) {
    const loginPage = new LoginPage(page);

    await loginPage.login(users.standard.username, users.standard.password);

    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html'); 

    await expect(page.getByText("Products")).toBeVisible();
});
test("login form supports keyboard navigation", async function({ page }) {
    const loginPage = new LoginPage(page);

    await loginPage.usernameInput.focus();

    await page.keyboard.press("Tab");

    await expect(loginPage.passwordInput).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(loginPage.loginButton).toBeFocused();
});
test("login button submits with Enter", async function({ page }) {
    const loginPage = new LoginPage(page);

        await loginPage.usernameInput.fill(users.standard.username);
        await loginPage.passwordInput.fill(users.standard.password);

        await loginPage.usernameInput.focus();

        await page.keyboard.press("Tab");
        await expect(loginPage.passwordInput).toBeFocused();

        await page.keyboard.press("Tab");
        await expect(loginPage.loginButton).toBeFocused();

        await page.keyboard.press("Enter");


        await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
});
test("login submits when pressing Enter in password field", async function({ page }) {        
        const loginPage = new LoginPage(page);

            await loginPage.usernameInput.fill(users.standard.username);
            await loginPage.passwordInput.fill(users.standard.password);

            await loginPage.passwordInput.focus();

            await page.keyboard.press("Enter");


            await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');

});
});

test.describe("Failed Login", function() {

test("invalid login", async function({ page }) {
    const loginPage = new LoginPage(page);

    await loginPage.login(users.standard.username, invalidCredentials.wrongPassword);

    await expect(loginPage.errorMessage).toHaveText(

    "Epic sadface: Username and password do not match any user in this service"
);
    await expect(page).toHaveURL("https://www.saucedemo.com/");
});

test("login with empty password", async function({ page }) {

    const loginPage = new LoginPage(page);

    await loginPage.login(users.standard.username, "" );

    await expectLoginError(
    loginPage, "Epic sadface: Password is required");
});

test("test an empty username", async function({ page }) {
    const loginPage = new LoginPage(page);

    await loginPage.login("", invalidCredentials.wrongPassword);

    await expectLoginError(
        loginPage, "Epic sadface: Username is required"
    );

});

test("incorrect username", async function({ page }) {
    const loginPage = new LoginPage(page);

    await loginPage.login(invalidCredentials.wrongUsername, users.standard.password);

    await expectLoginError(loginPage,
        "Epic sadface: Username and password do not match any user in this service")

});

test("no input", async function ({ page }) {
    const loginPage = new LoginPage(page);

    await loginPage.login("", "");

    await expectLoginError(loginPage, "Epic sadface: Username is required")
});
test("locked out user cannot log in", async function({ page}) {
    const loginPage = new LoginPage(page);

    await loginPage.login(users.lockedOut.username, users.lockedOut.password);

    await expectLoginError(loginPage,
        "Epic sadface: Sorry, this user has been locked out.")

     await expect(page).toHaveURL("https://www.saucedemo.com/");

});
});