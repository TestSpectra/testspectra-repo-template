describe("Mobile App - Example Test", () => {
  it('should interact with the button and find "Dark" text', async () => {
    // Click the button using XPath
    const button = $("//android.widget.Button");
    await button.click();

    // Verify text "Dark" is displayed
    const darkText = $('android=new UiSelector().text("Dark")');
    await expect(darkText).toBeDisplayed();
  })
});
