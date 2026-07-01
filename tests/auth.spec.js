const { test, expect } = require('@playwright/test');

// Her test koşusunda benzersiz email oluşturuyoruz
const timestamp = Date.now();
const NEW_USER_EMAIL = `loopbtest+${timestamp}@gmail.com`;
const NEW_USER_PASSWORD = 'TestPass1';

test.describe('LoopB Auth Tests', () => {

  // ── MEVCUT TESTLER ──────────────────────────────────────

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
    await page.locator('input').first().fill('yanlis@email.com');
    await page.locator('input[type="password"]').fill('YanlisŞifre999!');
    await page.locator('button').filter({ hasText: 'Login' }).click();
    await page.waitForTimeout(3000);
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

  // ── YENİ TESTLER ────────────────────────────────────────

  test('5 - Gerçek kullanıcı ile başarılı login', async ({ page }) => {
    await page.goto('https://app.loopb.com/auth/login');

    // Email ve şifre gir
    await page.locator('input').first().fill('karacakubra89@gmail.com');
    await page.locator('input[type="password"]').fill('K123456');
    await page.locator('button').filter({ hasText: 'Login' }).click();

    // Dashboard'a yönlendirmeli
    await page.waitForURL(/dashboard/, { timeout: 15000 });
    console.log('✅ Gerçek kullanıcı ile login başarılı');
  });

  test('6 - Yeni kullanıcı kaydı (register)', async ({ page }) => {
    await page.goto('https://app.loopb.com/auth/register');

    // "Sign Up with Email" butonuna tıkla
    await page.getByText('Sign Up with Email').click();

    // Email ve şifre doldur
    await page.locator('input[type="email"], input[placeholder*="email"]').fill(NEW_USER_EMAIL);
    await page.locator('input[type="password"], input[placeholder*="password"]').fill(NEW_USER_PASSWORD);

    // Sign Up butonuna bas
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Onboarding veya dashboard'a yönlendirmeli
    await page.waitForURL(/onboarding|dashboard/, { timeout: 20000 });
    console.log(`✅ Yeni kullanıcı kaydı başarılı: ${NEW_USER_EMAIL}`);
  });

});
