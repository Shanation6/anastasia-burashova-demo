import { test, expect } from '@playwright/test';

test('public site renders at desktop and mobile without overflow or runtime errors', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  for (const [width, height] of [[1440, 1000], [390, 844], [320, 740], [768, 1024]]) {
    await page.setViewportSize({ width, height });
    await page.goto('./');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 1440 || width === 390) await page.screenshot({ path: testInfo.outputPath(`${width}.png`) });
    await page.locator('#formats').scrollIntoViewIfNeeded();
    await expect(page.locator('.format-grid')).toBeVisible();
    if (width === 1440) await page.screenshot({ path: testInfo.outputPath('formats.png') });
    if (width === 768) await page.screenshot({ path: testInfo.outputPath('tablet-formats.png') });
    await page.locator('#booking').scrollIntoViewIfNeeded();
    if (width === 390) {
      await expect(page.locator('.mobile-booking')).toHaveClass(/is-hidden/);
      await page.screenshot({ path: testInfo.outputPath('mobile-form.png') });
    }
  }
  expect(errors).toEqual([]);
});

test('Escape cancels a dialog even after an earlier confirmed deletion', async ({ page }) => {
  await page.goto('admin/login.html');
  await page.getByRole('button', { name: 'Подставить демо-доступ' }).click();
  await page.getByRole('button', { name: 'Войти в кабинет' }).click();
  await page.getByRole('button', { name: 'Удалить заявку: Анна · пример' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Удалить', exact: true }).click();
  await expect(page.locator('#count-all')).toHaveText('2');
  await page.getByRole('button', { name: 'Сбросить демо', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('#count-all')).toHaveText('2');
});

test('booking validates, keeps consent explicit, and shows persisted record in cabinet', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'В кабинете', exact: true }).click();
  await expect(page.locator('#individual-price')).toHaveText('3 500 ₽');
  await page.locator('.featured [data-service]').click();
  await expect(page.locator('#format')).toHaveValue('office');
  await page.getByRole('button', { name: 'Оставить демо-заявку' }).click();
  await expect(page.locator('#form-error')).toContainText('имя');
  await page.getByLabel('Как к вам обращаться').fill('Тестовый посетитель');
  await page.getByLabel('Контакт для ответа').fill('qa@example.com');
  await page.getByRole('button', { name: 'Оставить демо-заявку' }).click();
  await expect(page.locator('#form-error')).toContainText('условия');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Оставить демо-заявку' }).click();
  await expect(page.locator('#booking-success')).toBeVisible();
  await page.getByRole('link', { name: 'Посмотреть в кабинете' }).click();
  await page.getByLabel('Логин', { exact: true }).fill('admin');
  await page.getByLabel('Демо-пароль', { exact: true }).fill('wrong');
  await page.getByRole('button', { name: 'Войти в кабинет' }).click();
  await expect(page.locator('#login-error')).toContainText('не совпадают');
  await page.getByRole('button', { name: 'Подставить демо-доступ' }).click();
  await page.getByRole('button', { name: 'Войти в кабинет' }).click();
  await expect(page.locator('#count-all')).toHaveText('4');
  const card = page.getByRole('article').filter({ hasText: 'Тестовый посетитель' });
  await expect(card).toContainText('В Красноярске');
  await card.getByRole('combobox').selectOption('booked');
  await page.reload();
  await expect(card.getByRole('combobox')).toHaveValue('booked');
  await page.getByLabel('Поиск по имени или контакту').fill('qa@example.com');
  await expect(page.getByRole('article')).toHaveCount(1);
  await page.getByRole('button', { name: 'Удалить заявку: Тестовый посетитель' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Отмена', exact: true }).click();
  await expect(card).toBeVisible();
  await page.getByRole('button', { name: 'Удалить заявку: Тестовый посетитель' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Удалить', exact: true }).click();
  await expect(page.locator('#empty-state')).toBeVisible();
  await page.getByRole('button', { name: 'Выйти', exact: true }).click();
  await expect(page).toHaveURL(/login.html$/);
  await page.goto('admin/index.html');
  await expect(page).toHaveURL(/login.html$/);
});

test('keyboard menu, reduced motion, malicious demo text and denied storage recover safely', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await page.getByRole('button', { name: 'Открыть меню' }).click();
  await expect(page.getByRole('navigation')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Открыть меню' })).toBeFocused();
  await expect(page.getByRole('navigation')).toBeHidden();
  await page.getByLabel('Как к вам обращаться').fill('<img src=x onerror=alert(1)>');
  await page.getByLabel('Контакт для ответа').fill('safe@example.com');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Оставить демо-заявку' }).click();
  await expect(page.locator('#booking-success')).toBeVisible();
  await page.goto('admin/login.html');
  await page.getByRole('button', { name: 'Подставить демо-доступ' }).click();
  await page.getByRole('button', { name: 'Войти в кабинет' }).click();
  await expect(page.getByRole('heading', { name: '<img src=x onerror=alert(1)>' })).toBeVisible();
  await expect(page.locator('.application-list img')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('./');
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('storage denied'); }; });
  await page.getByLabel('Как к вам обращаться').fill('Демо');
  await page.getByLabel('Контакт для ответа').fill('safe@example.com');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Оставить демо-заявку' }).click();
  await expect(page.locator('#form-error')).toContainText('Хранилище');
  await expect(page.getByLabel('Как к вам обращаться')).toHaveValue('Демо');
});
