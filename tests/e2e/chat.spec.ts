import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('creates an offline conversation and restores it after reload', async ({ page }) => {
  const prompt = 'Hola, ¿qué puedes hacer?';

  await page.getByRole('textbox', { name: 'Mensaje' }).fill(prompt);
  await page.getByLabel('Enviar mensaje').click();

  await expect(page.getByRole('heading', { name: prompt })).toBeVisible();
  await expect(page.getByText(/Soy VORTEX/).first()).toBeVisible();

  await page.reload();

  await expect(page.getByRole('heading', { name: prompt })).toBeVisible();
  await expect(page.getByText(/Soy VORTEX/).first()).toBeVisible();
});

test('saves BYOK settings and sends through a mocked OpenRouter response', async ({ page }) => {
  const apiKey = 'e2e-test-key';

  await page.route('https://openrouter.ai/api/v1/chat/completions', async (route) => {
    const request = route.request();
    expect(request.headers().authorization).toBe(`Bearer ${apiKey}`);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        choices: [{ message: { content: 'Respuesta E2E de OpenRouter' } }],
      }),
    });
  });

  await page.getByLabel('Abrir configuración').click();
  await page.getByRole('button', { name: /OpenRouter/i }).click();
  await page.getByPlaceholder(/OpenRouter API Key/i).fill(apiKey);
  await page.getByRole('button', { name: 'GUARDAR CAMBIOS' }).click();

  await page.getByRole('textbox', { name: 'Mensaje' }).fill('Prueba el proveedor');
  await page.getByLabel('Enviar mensaje').click();
  await expect(page.getByText('Respuesta E2E de OpenRouter', { exact: true })).toBeVisible();

  await page.reload();
  await page.getByLabel('Abrir configuración').click();
  await expect(page.getByPlaceholder(/OpenRouter API Key/i)).toHaveValue(apiKey);
  await expect(page.getByPlaceholder(/OpenRouter API Key/i)).toHaveAttribute('type', 'password');
});

test('falls back locally when the configured provider rejects the request', async ({ page }) => {
  await page.route('https://openrouter.ai/api/v1/chat/completions', (route) =>
    route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({ error: { message: 'rate limited' } }),
    }),
  );

  await page.getByLabel('Abrir configuración').click();
  await page.getByRole('button', { name: /OpenRouter/i }).click();
  await page.getByPlaceholder(/OpenRouter API Key/i).fill('e2e-rate-limit-key');
  await page.getByRole('button', { name: 'GUARDAR CAMBIOS' }).click();

  await page.getByRole('textbox', { name: 'Mensaje' }).fill('¿Qué es React?');
  await page.getByLabel('Enviar mensaje').click();

  await expect(page.getByText(/Error de conexión con openrouter: rate limited/)).toBeVisible();
  await expect(page.getByText(/Respuesta local:/)).toBeVisible();
});
