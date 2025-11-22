describe("Mobile App - Example Test", () => {
  it('should interact with the button and find "Dark" text', async () => {
    // Click the button using XPath
    const button = await $("//android.widget.Button");
    await button.click();

    // Wait briefly for any UI transition
    await driver.pause(1000);

    // Verify text "Dark" is displayed
    const darkText = await $('android=new UiSelector().text("Dark")');
    await expect(darkText).toBeDisplayed();
  });
});
