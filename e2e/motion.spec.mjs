import { test, expect } from '@playwright/test';

test('visitor can pause decorative motion and still read every chapter', async ({ page }) => {
  await page.goto('./');
  const toggle = page.getByRole('button', { name: 'Приостановить анимацию', exact: true });
  await expect(toggle).toBeVisible();
  await expect(page.locator('.portrait-seal .motion-ornament')).toHaveCSS('animation-play-state', 'running');
  await toggle.click();
  await expect(page.getByRole('button', { name: 'Включить анимацию', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.portrait-seal .motion-ornament')).toHaveCSS('animation-play-state', 'paused');
  await page.locator('#about').scrollIntoViewIfNeeded();
  await expect(page.locator('#about h2')).toHaveCSS('opacity', '1');
  await page.locator('#booking').scrollIntoViewIfNeeded();
  await expect(page.locator('#booking-form')).toBeVisible();
  await page.getByRole('button', { name: 'Включить анимацию', exact: true }).click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.portrait-seal .motion-ornament')).toHaveCSS('animation-play-state', 'paused');
});

test('scroll choreography reveals content and reduced-motion keeps the same information', async ({ page }) => {
  await page.goto('./');
  await page.locator('#requests').scrollIntoViewIfNeeded();
  await expect(page.locator('.request-list')).toHaveCSS('opacity', '1');
  await page.locator('#formats').scrollIntoViewIfNeeded();
  await expect(page.locator('.format-card').first()).toHaveCSS('opacity', '1');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.motion-toggle')).toBeHidden();
  for (const selector of ['.hero-copy', '.about-story', '.format-card', '.booking-panel']) {
    await expect(page.locator(selector).first()).toHaveCSS('opacity', '1');
  }
});

test('public content stays readable when JavaScript is unavailable', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4174/site/');
  for (const selector of ['h1', '#about h2', '.format-card', '.booking-panel']) await expect(page.locator(selector).first()).toHaveCSS('opacity', '1');
  await context.close();
});

test('normal motion reflows at phone, tablet and desktop widths', async ({ page }, testInfo) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('./');
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('.motion-toggle')).toBeVisible();
    if (width === 390 || width === 1440) {
      await page.getByRole('button', { name: 'Приостановить анимацию', exact: true }).click();
      await page.screenshot({ path: testInfo.outputPath(`editorial-${width}.png`) });
      await page.locator('.pause-section').scrollIntoViewIfNeeded();
      await page.locator('.pause-image').evaluate(image => image.decode());
      await page.screenshot({ path: testInfo.outputPath(`atmosphere-${width}.png`) });
      await page.getByRole('button', { name: 'Включить анимацию', exact: true }).click();
    }
  }
});

test('booking shortcut stays fixed and clears the form at the 700px breakpoint', async ({ page }) => {
  await page.setViewportSize({ width: 700, height: 900 });
  await page.goto('./');
  const shortcut = page.locator('.mobile-booking');
  await expect(shortcut).toHaveCSS('position', 'fixed');
  await page.locator('#booking').scrollIntoViewIfNeeded();
  await expect(shortcut).toHaveClass(/is-hidden/);
  await expect.poll(async () => (await shortcut.boundingBox()).y).toBeGreaterThan(900);
});
