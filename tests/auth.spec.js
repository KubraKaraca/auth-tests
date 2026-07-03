const { test, expect } = require('@playwright/test');

const timestamp = Date.now();
const NEW_USER_EMAIL = `loopbtest+${timestamp}@gmail.com`;
const NEW_USER_PASSWORD = 'TestPass1';

// Email adresini dosyaya yaz, workflow okusun
const fs = require('fs');
fs.writeFileSync('test-email.txt', NEW_USER_EMAIL);

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

  test('5 - Gerçek kullanıcı ile başarılı login', async ({ page }) => {
    await page.goto('https://app.loopb.com/auth/login');
    await page.locator('input').first().fill('karacakubra89@gmail.com');
    await page.locator('input[type="password"]').fill('K123456');
    await page.locator('button').filter({ hasText: 'Login' }).click();
    await page.waitForURL(/dashboard/, { timeout: 15000 });
    console.log('✅ Gerçek kullanıcı ile login başarılı');
  });

  test('6 - Yeni kullanıcı kaydı + onboarding + dashboard', async ({ page }) => {

    // ── REGISTER ──────────────────────────────────────────
    await page.goto('https://app.loopb.com/auth/register');
    await page.getByText('Sign Up with Email').click();
    await page.locator('input[type="email"], input[placeholder*="email"]').fill(NEW_USER_EMAIL);
    await page.locator('input[type="password"], input[placeholder*="password"]').fill(NEW_USER_PASSWORD);
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await page.waitForURL(/onboard/, { timeout: 20000 });
    console.log('✅ Kayıt başarılı, onboarding başladı');

    // ── ONBOARDING ADIM 1: Ad, Soyad, Checkbox ────────────
    await page.locator('input[placeholder*="first name"]').fill('Test');
    await page.locator('input[placeholder*="last name"]').fill('Kullanici');
    // İlk zorunlu checkbox'ı işaretle
    // Checkbox'ı birkaç farklı yöntemle dene
    // Zorunlu checkbox'a tıkla (button#agreeToTerms)
    await page.locator('#agreeToTerms').click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForTimeout(1500);
    console.log('✅ Onboarding Adım 1 tamamlandı (Ad/Soyad)');

    // ── ONBOARDING ADIM 2: Şirket Kurulumu ────────────────
    // Şirket adını temizle ve "Hipposoft Test" yaz
    await page.locator('#companyName').clear();
    await page.locator('#companyName').fill('Hipposoft Test');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForTimeout(1500);
    console.log('✅ Onboarding Adım 2 tamamlandı (Şirket)');

    // ── ONBOARDING ADIM 3: Kullanım Amacı ─────────────────
    // Seçim zorunlu değil, direkt Continue
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForTimeout(1500);
    console.log('✅ Onboarding Adım 3 tamamlandı (Kullanım amacı)');

    // ── ONBOARDING ADIM 4: Takım Daveti ───────────────────
    // Her seferinde benzersiz bir davet e-postası oluştur
    // Davet input'unun görünmesini bekle (sayfa tam yüklensin)
    await page.locator('input[placeholder*="email"]').waitFor({ timeout: 10000 });
    const INVITE_EMAIL = `loopbinvite+${timestamp}@gmail.com`;
    await page.locator('input[placeholder*="email"]').fill(INVITE_EMAIL);
    await page.waitForTimeout(1000);
    console.log(`✅ Davet e-postası girildi: ${INVITE_EMAIL}`);
    // Butonu bekle ve tıkla
    await page.getByRole('button', { name: 'Continue' }).waitFor({ timeout: 10000 });
    await page.getByRole('button', { name: 'Continue' }).click();
    // Adım 5'in yüklenmesini bekle (Community sayfası)
    await page.getByText('Create your first community').waitFor({ timeout: 15000 });
    console.log('✅ Onboarding Adım 4 tamamlandı (Takım daveti)');
    
    // ── ONBOARDING ADIM 5: Community Oluşturma ────────────
    // Community adı doldur ve devam et
   await page.locator('textarea').first().fill('Hipposoft Test Community');
   await page.waitForTimeout(500);
   await page.getByRole('button', { name: 'Continue' }).click();

   // Loading bitmesini ve sonraki sayfaya geçişi bekle
   await page.locator('textarea').first().fill('Hipposoft Test Community');
   await page.waitForTimeout(1000);
   await page.getByRole('button', { name: 'Continue' }).click();
   console.log('✅ Onboarding Adım 5 tamamlandı (Community)');

   // ── Dashboard'a ulaşmayı bekle (animasyon dahil) ──────
   await page.waitForURL(/dashboard/, { timeout: 90000, waitUntil: 'domcontentloaded' });
}
    console.log('✅ Onboarding tamamlandı, dashboard\'a ulaşıldı');

  });

});
