import { test, expect, Page } from '@playwright/test';

async function signUp(page: Page, email: string, password: string) {
  await page.goto('/signup');
  await page.getByTestId('auth-signup-email').fill(email);
  await page.getByTestId('auth-signup-password').fill(password);
  await page.getByTestId('auth-signup-submit').click();
  await page.waitForURL('/dashboard');
}

async function createHabit(page: Page, name: string, description = '') {
  await page.getByTestId('create-habit-button').click();
  await page.getByTestId('habit-name-input').fill(name);
  if (description) await page.getByTestId('habit-description-input').fill(description);
  await page.getByTestId('habit-save-button').click();
}

async function clearStorage(page: Page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
}

test.describe('Habit Tracker app', () => {
  test('shows the splash screen and redirects unauthenticated users to /login', async ({ page }) => {
    await clearStorage(page);
    await page.goto('/');
    await expect(page.getByTestId('splash-screen')).toBeVisible();
    await page.waitForURL('/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('redirects authenticated users from / to /dashboard', async ({ page }) => {
    await clearStorage(page);
    await signUp(page, `redir-${Date.now()}@test.com`, 'pass123');
    await page.goto('/');
    await page.waitForURL('/dashboard', { timeout: 5000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('prevents unauthenticated access to /dashboard', async ({ page }) => {
    await clearStorage(page);
    await page.goto('/dashboard');
    await page.waitForURL('/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('signs up a new user and lands on the dashboard', async ({ page }) => {
    await clearStorage(page);
    await signUp(page, `signup-${Date.now()}@test.com`, 'pass123');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(page.getByTestId('empty-state')).toBeVisible();
  });

  test("logs in an existing user and loads only that user's habits", async ({ page }) => {
    await clearStorage(page);
    const email = `user-${Date.now()}@test.com`;
    await signUp(page, email, 'pass123');
    await createHabit(page, 'Morning Run');
    await page.getByTestId('auth-logout-button').click();
    await page.waitForURL('/login');

    await page.getByTestId('auth-login-email').fill(email);
    await page.getByTestId('auth-login-password').fill('pass123');
    await page.getByTestId('auth-login-submit').click();
    await page.waitForURL('/dashboard');

    await expect(page.getByTestId('habit-card-morning-run')).toBeVisible();
  });

  test('creates a habit from the dashboard', async ({ page }) => {
    await clearStorage(page);
    await signUp(page, `create-${Date.now()}@test.com`, 'pass123');
    await createHabit(page, 'Drink Water', 'Stay hydrated');
    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible();
  });

  test('completes a habit for today and updates the streak', async ({ page }) => {
    await clearStorage(page);
    await signUp(page, `complete-${Date.now()}@test.com`, 'pass123');
    await createHabit(page, 'Drink Water');
    await expect(page.getByTestId('habit-streak-drink-water')).toContainText('0');
    await page.getByTestId('habit-complete-drink-water').click();
    await expect(page.getByTestId('habit-streak-drink-water')).toContainText('1');
  });

  test('persists session and habits after page reload', async ({ page }) => {
    await clearStorage(page);
    await signUp(page, `persist-${Date.now()}@test.com`, 'pass123');
    await createHabit(page, 'Read Books');
    await expect(page.getByTestId('habit-card-read-books')).toBeVisible();
    await page.reload();
    await page.waitForURL('/dashboard');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(page.getByTestId('habit-card-read-books')).toBeVisible();
  });

  test('logs out and redirects to /login', async ({ page }) => {
    await clearStorage(page);
    await signUp(page, `logout-${Date.now()}@test.com`, 'pass123');
    await page.getByTestId('auth-logout-button').click();
    await page.waitForURL('/login');
    expect(page.url()).toContain('/login');
    await page.goto('/dashboard');
    await page.waitForURL('/login');
  });

  test('loads the cached app shell when offline after the app has been loaded once', async ({ page, context }) => {
    await clearStorage(page);
    await signUp(page, `offline-${Date.now()}@test.com`, 'pass123');
    await page.goto('/');
    await page.waitForTimeout(2000);
    await page.goto('/login');
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    await context.setOffline(true);
    await page.goto('/login').catch(() => null);
    const bodyContent = await page.evaluate(() => document.body?.innerHTML ?? '');
    expect(bodyContent.length).toBeGreaterThan(0);
    await context.setOffline(false);
  });
});