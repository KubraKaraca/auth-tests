const { test, expect } = require('@playwright/test');

const timestamp = Date.now();
const TEST_EMAIL = `test+${timestamp}@gmail.com`;
const TEST_PASSWORD = 'TestPass123!';

test.describe('LoopB Auth Tests', () => {

  test('1 - Login sayfası açılıyor mu?', async ({ page }) => {
    await page.goto('https://app.loopb.com/auth/login');
    await expect(page).toHaveTitle(/Login/i);
    console.log('✅ Login sayfası başarıyla açıldı');
  });

  test('2 - Register sayfası açılıyor mu?', async ({ page }) => {
    await page.goto('https://app.loopb.com/auth/register');
    await expect(page).toHaveTitle(/Create an account/i);
    console.log('✅ Register sayfası başarıyla açıldı');
  });

  test('3 - Hatalı şifre ile login başarısız olmalı', async ({ page }) => {
    await page.goto('https://app.loopb.com/auth/login');
    await page.fill('input[type="email"], input[placeholder*="Email"], input[placeholder*="Contact"]', 'yanlis@email.com');
    await page.fill('input[type="password"]', 'YanlisŞifre999!');
    await page.click('button[type="submit"], button:has-text("Login")');
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/dashboard');
    console.log('✅ Hatalı girişte yönlendirme yapılmadı');
  });

  test('4 - Login sayfasından Register sayfasına geçiş çalışıyor mu?', async ({ page }) => {
    await page.goto('https://app.loopb.com/auth/login');
    await page.getByText('Sign up now').click();
    await expect(page).toHaveURL(/register/);
    console.log('✅ Login → Register yönlendirmesi çalışıyor');
  });

});
