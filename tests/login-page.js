class LoginPage {
constructor(page) {
    this.page = page;

    this.usernameInput = page.getByPlaceholder("Username");
    this.passwordInput = page.getByPlaceholder("Password");
    this.loginButton = page.getByRole("button", { name: "Login" });

    this.errorMessage = page.locator("[data-test='error']");
    
}
async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
}

async goto() {
    await this.page.goto("https://www.saucedemo.com");
}
}

export { LoginPage };