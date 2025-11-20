
describe('The Internet - Login Page', () => {
    it('should login successfully with valid credentials', async () => {
        // Navigate to login page
        await browser.url('/login');
        
        // Wait for page to load
        await browser.pause(1000);
        
        // Find username and password fields
        const usernameField = await $('#username');
        const passwordField = await $('#password');
        const loginButton = await $('button[type="submit"]');
        
        // Enter credentials (the-internet.herokuapp.com demo credentials)
        await usernameField.setValue('tomsmith');
        await passwordField.setValue('SuperSecretPassword!');
        
        // Click login button
        await loginButton.click();
        
        // Wait for redirect
        await browser.pause(1000);
        
        // Verify successful login
        const successMessage = await $('.flash.success');
        await expect(successMessage).toBeDisplayed();
        await expect(successMessage).toHaveText(expect.stringContaining('You logged into a secure area!'));
        
        // Verify URL changed
        await expect(browser).toHaveUrl('https://the-internet.herokuapp.com/secure');
    });

    it('should show error with invalid credentials', async () => {
        // Navigate to login page
        await browser.url('/login');
        
        // Wait for page to load
        await browser.pause(1000);
        
        // Find username and password fields
        const usernameField = await $('#username');
        const passwordField = await $('#password');
        const loginButton = await $('button[type="submit"]');
        
        // Enter invalid credentials
        await usernameField.setValue('invaliduser');
        await passwordField.setValue('invalidpassword');
        
        // Click login button
        await loginButton.click();
        
        // Wait for error message
        await browser.pause(1000);
        
        // Verify error message
        const errorMessage = await $('.flash.error');
        await expect(errorMessage).toBeDisplayed();
        await expect(errorMessage).toHaveText(expect.stringContaining('Your username is invalid!'));
    });
});
