import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('cancels an in-flight provider response and exports the chat as JSON', async ({ page }) => {
  let releaseResponse: (() => void) | undefined;
  const gate = new Promise<void>((resolve) => {
    releaseResponse = resolve;
  });

  await page.route('https://openrouter.ai/api/v1/chat/completions', async (route) => {
    await gate;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        choices: [{ message: { content: 'Respuesta que no debería llegar' } }],
      }),
    });
  });

  await page.getByLabel('Abrir configuración').click();
  await page.getByRole('button', { name: /OpenRouter/i }).click();
  await page.getByPlaceholder(/OpenRouter API Key/i).fill('e2e-cancel-key');
  await page.getByRole('button', { name: 'GUARDAR CAMBIOS' }).click();

  await page.getByRole('textbox', { name: 'Mensaje' }).fill('Cancela esta respuesta');
  await page.getByLabel('Enviar mensaje').click();

  await expect(page.getByRole('button', { name: /Detener respuesta/i })).toBeVisible();
  await page.getByRole('button', { name: /Detener respuesta/i }).click();
  await expect(page.getByText(/Generación detenida/i)).toBeVisible();
  await expect(page.getByText('Respuesta que no debería llegar')).toHaveCount(0);

  releaseResponse?.();

  const downloadPromise = page.waitForEvent('download');
  await page.getByLabel('Abrir configuración').click();
  await page.getByRole('button', { name: /EXPORTAR JSON/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.json$/);
  await expect(page.getByText(/Exportación lista|Conversación exportada/i)).toBeVisible();
});

test('saves offline settings and exports markdown from settings', async ({ page }) => {
  await page.getByLabel('Abrir configuración').click();
  await page.getByRole('button', { name: /Offline/i }).click();
  await page.getByRole('button', { name: 'GUARDAR CAMBIOS' }).click();
  await expect(page.getByText(/Modo local listo/i)).toBeVisible();

  await page.getByRole('textbox', { name: 'Mensaje' }).fill('Exportame esto');
  await page.getByLabel('Enviar mensaje').click();
  await expect(page.getByText(/Soy VORTEX|puedo/i).first()).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByLabel('Abrir configuración').click();
  await page.getByRole('button', { name: /EXPORTAR MD/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.md$/);
});
