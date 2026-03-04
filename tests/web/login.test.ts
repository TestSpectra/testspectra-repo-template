describe("Tagsamurai - Login", () => {
    it("visit dev-app and input credentials then find login button", async () => {
        await browser.url("https://dev-app.tagsamurai.com");

        await $('[data-ts-name="login-password-email"] input').setValue("company9@sharklasers.com");
        await $('[data-ts-name="login-password-password"] input').setValue("Moderator12@");
        await $('[data-ts-name="btn-login"]').click();

        await expect(browser).toHaveUrl(expect.stringContaining('/modules'));
        await browser.pause(1000)

        await browser.refresh()
    });
});
