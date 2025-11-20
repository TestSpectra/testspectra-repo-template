
describe('The Internet - Checkboxes', () => {
    it('should toggle checkboxes', async () => {
        // Navigate to checkboxes page
        await browser.url('/checkboxes');
        
        // Wait for page to load
        await browser.pause(1000);
        
        // Get all checkboxes
        const checkboxes = await $$('input[type="checkbox"]');
        
        // Verify we have 2 checkboxes
        expect(checkboxes.length).toBe(2);
        
        // First checkbox should be unchecked
        const isFirstChecked = await checkboxes[0].isSelected();
        expect(isFirstChecked).toBe(false);
        
        // Second checkbox should be checked
        const isSecondChecked = await checkboxes[1].isSelected();
        expect(isSecondChecked).toBe(true);
        
        // Click first checkbox to check it
        await checkboxes[0].click();
        await browser.pause(500);
        
        // Verify first checkbox is now checked
        const isFirstCheckedNow = await checkboxes[0].isSelected();
        expect(isFirstCheckedNow).toBe(true);
        
        // Click second checkbox to uncheck it
        await checkboxes[1].click();
        await browser.pause(500);
        
        // Verify second checkbox is now unchecked
        const isSecondCheckedNow = await checkboxes[1].isSelected();
        expect(isSecondCheckedNow).toBe(false);
    });
});
