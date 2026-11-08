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
test.describe("Inventory", function() {
    
test("inventory page displays products", async function({ page }) {
    const loginPage = new LoginPage(page);

    await loginPage.login(users.standard.username, users.standard.password);

    await expect(page).toHaveURL("https://www.saucedemo.com/inventory.html");

    await expect(page.getByText("Sauce Labs Backpack")).toBeVisible();
});
test("user can add product to cart", async function({ page }) {

    const loginPage = new LoginPage(page);

    await loginPage.login(users.standard.username, users.standard.password);

    const backpack = page.locator(".inventory_item").filter({ hasText: "Sauce Labs Backpack" });

    await backpack.getByRole("button", { name: "Add to cart" }).click();

    await expect(page.locator(".shopping_cart_badge")).toHaveText("1");
});
test("verifying the correct product was added", async function({ page }) {
    const loginPage = new LoginPage(page);

    // 1. Login
    await loginPage.login(users.standard.username, users.standard.password);

    // 2. Find Backpack on the inventory page
    const backpack = page.locator(".inventory_item").filter({
        hasText: "Sauce Labs Backpack"
    });

    // 3. Add Backpack to cart
    await backpack.getByRole("button", { name: "Add to cart" }).click();

    // 4. Verify cart badge
    await expect(page.locator(".shopping_cart_badge")).toHaveText("1");

    // 5. Open shopping cart
    await page.locator(".shopping_cart_link").click();

    await expect(page).toHaveURL("https://www.saucedemo.com/cart.html");

    // 6. Find Backpack inside the cart
    const cartBackpack = page.locator(".cart_item").filter({
        hasText: "Sauce Labs Backpack"
    });

    // 7. Verify product details
    await expect(cartBackpack.locator(".inventory_item_name")).toHaveText("Sauce Labs Backpack");

    await expect(cartBackpack.locator(".cart_quantity")).toHaveText("1");

    await expect(cartBackpack.locator(".inventory_item_price")).toHaveText("$29.99");
});
test("user can remove product from cart", async function({ page }) {
    const loginPage = new LoginPage(page);

    await loginPage.login(users.standard.username, users.standard.password);

        const backpack = page.locator(".inventory_item").filter({
        hasText: "Sauce Labs Backpack"
    });

        await backpack.getByRole("button", { name: "Add to cart" }).click();

        await page.locator(".shopping_cart_link").click();

        await expect(page).toHaveURL("https://www.saucedemo.com/cart.html");

            const cartBackpack = page.locator(".cart_item").filter({
        hasText: "Sauce Labs Backpack"
    });

            await cartBackpack.getByRole("button", { name: "Remove" }).click();

            await expect(cartBackpack).toHaveCount(0);

});
});