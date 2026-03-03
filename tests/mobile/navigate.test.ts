describe("Mobile App - Example Test", () => {
  it('should open Global Settings', async () => {
    // Click the Global Settings button using accessibility id
    const globalSettings = $("~Global Settings");
    await globalSettings.click();
  })
});
