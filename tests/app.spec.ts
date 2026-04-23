import { test, expect } from '@playwright/test';

test.describe('TeamBalancer E2E Test Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    // Ensure the dev server is running before executing
    await page.goto('http://localhost:5173/'); 
  });

  test('Feature 1: Authentication Flow (Login & Register -> Master)', async ({ page }) => {
    await page.getByRole('button', { name: 'Get Started' }).click();
    await expect(page).toHaveURL(/.*\/login/);

    // FIX: Wait for the inputs to be stable (animations finished)
    const emailInput = page.locator('#email');
    await expect(emailInput).toBeVisible();
    
    await emailInput.fill('coach@teambalancer.com');
    await page.locator('#password').fill('securepassword123');
    
    // FIX: Press 'Enter' to natively trigger the form submit, 
    // bypassing any animation click-interception issues.
    await page.locator('#password').press('Enter');
    
    // Should redirect to Master Page
    await expect(page).toHaveURL(/.*\/matches/);
    await expect(page.getByText('Recent Matches')).toBeVisible();
  });

  test('Feature 2: Master Page to Detail View Navigation', async ({ page }) => {
    await page.goto('http://localhost:5173/matches');
    
    // Wait for the table to load and click the first row
    const firstMatchRow = page.locator('tbody tr').first();
    await expect(firstMatchRow).toBeVisible();
    await firstMatchRow.click();

    // Verify transition to detail page
    await expect(page).toHaveURL(/.*\/matches\/.+/);
    await expect(page.getByText('Match Details')).toBeVisible();
    await expect(page.getByText('Final Score')).toBeVisible();
  });

  test('Feature 3: Statistics Real-time Data Simulation', async ({ page }) => {
    await page.goto('http://localhost:5173/statistics');
    
    await expect(page.getByText('Win Distribution')).toBeVisible();
    await expect(page.getByText('Player Rankings')).toBeVisible();

    const simButton = page.getByRole('button', { name: /Simulate/i });
    await expect(simButton).toBeVisible();
    await simButton.click();

    // Verify button state changes
    const stopButton = page.getByRole('button', { name: /Stop Sim/i });
    await expect(stopButton).toBeVisible();

    // Let it run for 2 seconds to ensure DOM updates occur
    await page.waitForTimeout(2000);

    // Stop Simulation
    await stopButton.click();
    await expect(simButton).toBeVisible(); 
  });

  test('Feature 4: Registration Flow & Form Validation (Edge Cases)', async ({ page }) => {
    await page.goto('http://localhost:5173/register');

    // Setup dialog handler to intercept the window.alert() calls
    const dialogMessages: string[] = [];
    page.on('dialog', async dialog => {
      dialogMessages.push(dialog.message());
      await dialog.accept();
    });

    // Test 1: Passwords do not match
    await page.locator('#name').fill('New Coach');
    await page.locator('#email').fill('new@coach.com');
    await page.locator('#password').fill('password123');
    await page.locator('#confirmPassword').fill('password456');
    // Using force: true to ensure animations don't block the click
    await page.getByRole('button', { name: 'Create Account' }).click({ force: true });
    
    expect(dialogMessages).toContain('Passwords do not match!');

    // Test 2: Password is too short
    await page.locator('#password').fill('123');
    await page.locator('#confirmPassword').fill('123');
    await page.getByRole('button', { name: 'Create Account' }).click({ force: true });
    
    expect(dialogMessages).toContain('Password must be at least 6 characters.');

    // Test 3: Successful Registration
    await page.locator('#password').fill('secure123');
    await page.locator('#confirmPassword').fill('secure123');
    await page.locator('#confirmPassword').press('Enter');

    await expect(page).toHaveURL(/.*\/matches/);
  });

  test('Feature 5: Complete CRUD Lifecycle (Create, Edit, Delete Match)', async ({ page }) => {
    await page.goto('http://localhost:5173/matches');

    // --- CREATE ---
    await page.getByRole('button', { name: 'Add Match' }).click();
    await page.locator('#date').fill('2026-10-10');
    await page.locator('#teamA-0').fill('Test Player');
    await page.locator('#scoreA').fill('25');
    await page.locator('#scoreB').fill('20');
    await page.getByRole('button', { name: 'Create Match' }).click({ force: true });

    // Verify it appears in the list
    await expect(page.getByText('Oct 10, 2026').first()).toBeVisible();

    // --- EDIT ---
    const row = page.locator('tr', { hasText: 'Oct 10, 2026' }).first();
    await row.locator('button').first().click(); // Clicks the Edit button
    
    await page.locator('#scoreA').fill('21');
    await page.getByRole('button', { name: 'Save Changes' }).click({ force: true });

    // Verify it updated
    await expect(page.getByText('Team A: 21').first()).toBeVisible();

    // --- DELETE ---
    await row.locator('button').nth(1).click(); // Clicks the Delete button
    await page.getByRole('button', { name: 'Delete Match' }).click({ force: true });

    // Verify it was removed
    await expect(page.getByText('Oct 10, 2026')).not.toBeVisible();
  });

  test('Feature 6: Synergy Engine Interactive Network Graph', async ({ page }) => {
    await page.goto('http://localhost:5173/synergy');

    await expect(page.getByText('Player Chemistry Network')).toBeVisible();

    const playerNode = page.locator('circle[stroke="white"]').first();
    await expect(playerNode).toBeVisible();

    await playerNode.click({ force: true });

    // Verify that the UI side panels render their contents
    await expect(page.getByText('High Chemistry Pairs')).toBeVisible();
    await expect(page.getByText('Friction Pairs')).toBeVisible();
  });
});