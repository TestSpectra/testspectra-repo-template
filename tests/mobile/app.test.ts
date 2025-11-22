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

    await driver
      .action("pointer")
      .move({ duration: 0, x: 729, y: 766 })
      .down({ button: 0 })
      .move({ duration: 1000, x: 668, y: 172 })
      .up({ button: 0 })
      .perform();

    await driver
      .action("pointer")
      .move({ duration: 0, x: 508, y: 2064 })
      .down({ button: 0 })
      .move({ duration: 1000, x: 520, y: 328 })
      .up({ button: 0 })
      .perform();

    await driver
      .action("pointer")
      .move({ duration: 0, x: 185, y: 2213 })
      .down({ button: 0 })
      .pause(50)
      .up({ button: 0 })
      .perform();

    await driver
      .action("pointer")
      .move({ duration: 0, x: 461, y: 1487 })
      .down({ button: 0 })
      .move({ duration: 1000, x: 463, y: 469 })
      .up({ button: 0 })
      .perform();

    await driver
      .action("pointer")
      .move({ duration: 0, x: 590, y: 1185 })
      .down({ button: 0 })
      .move({ duration: 1000, x: 560, y: 671 })
      .up({ button: 0 })
      .perform();

    await driver
      .action("pointer")
      .move({ duration: 0, x: 538, y: 1310 })
      .down({ button: 0 })
      .move({ duration: 1000, x: 525, y: 899 })
      .up({ button: 0 })
      .perform();

    await driver
      .action("pointer")
      .move({ duration: 0, x: 586, y: 371 })
      .down({ button: 0 })
      .move({ duration: 1000, x: 578, y: 1140 })
      .up({ button: 0 })
      .perform();

    await driver
      .action("pointer")
      .move({ duration: 0, x: 144, y: 578 })
      .down({ button: 0 })
      .pause(50)
      .up({ button: 0 })
      .perform();

    await driver
      .action("pointer")
      .move({ duration: 0, x: 312, y: 1738 })
      .down({ button: 0 })
      .pause(50)
      .up({ button: 0 })
      .perform();

    await driver
      .action("pointer")
      .move({ duration: 0, x: 511, y: 1921 })
      .down({ button: 0 })
      .pause(50)
      .up({ button: 0 })
      .perform();

    await driver
      .action("pointer")
      .move({ duration: 0, x: 816, y: 2045 })
      .down({ button: 0 })
      .pause(50)
      .up({ button: 0 })
      .perform();

    await driver
      .action("pointer")
      .move({ duration: 0, x: 272, y: 1889 })
      .down({ button: 0 })
      .pause(50)
      .up({ button: 0 })
      .perform();

    await driver
      .action("pointer")
      .move({ duration: 0, x: 805, y: 1907 })
      .down({ button: 0 })
      .pause(50)
      .up({ button: 0 })
      .perform();

    await driver
      .action("pointer")
      .move({ duration: 0, x: 540, y: 1763 })
      .down({ button: 0 })
      .pause(50)
      .up({ button: 0 })
      .perform();

    await driver
      .action("pointer")
      .move({ duration: 0, x: 655, y: 2069 })
      .down({ button: 0 })
      .move({ duration: 1000, x: 649, y: 2069 })
      .up({ button: 0 })
      .perform();
  });
});
