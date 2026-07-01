const { test, expect } = require('@playwright/test');

// Her test koşusunda benzersiz bir email oluşturuyoruz
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

    // Email ve yanlış şifre gir
    await page.fill('input[type="email"], input[placeholder*="Email"], input[placeholder*="Contact"]', 'yanlis@email.com');
    await page.fill('input[type="password"]', 'YanlisŞifre999!');
    await page.click('button[type="submit"], button:has-text("Login")');

    // Hata mesajı çıkmalı, dashboard'a gitmemeli
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/dashboard');
    console.log('✅ Hatalı girişte yönlendirme yapılmadı — doğru davranış');
  });

  test('4 - Register sayfasında "Sign Up with Email" butonu var mı?', async ({ page }) => {
    await page.goto('https://app.loopb.com/auth/register');
    const signUpButton = page.getByText('Sign Up with Email');
    await expect(signUpButton).toBeVisible();
    console.log('✅ Sign Up with Email butonu görünür');
  });

  test('5 - Login sayfasından Register sayfasına geçiş çalışıyor mu?', async ({ page }) => {
    await page.goto('https://app.loopb.com/auth/login');
    await page.getByText('Sign up now').click();
    await expect(page).toHaveURL(/register/);
    console.log('✅ Login → Register yönlendirmesi çalışıyor');
  });

  test('6 - Register sayfasından Login sayfasına geçiş çalışıyor mu?', async ({ page }) => {
    await page.goto('https://app.loopb.com/auth/register');
    await page.getByText('Log in').click();
    await expect(page).toHaveURL(/login/);
    console.log('✅ Register → Login yönlendirmesi çalışıyor');
  });

});
