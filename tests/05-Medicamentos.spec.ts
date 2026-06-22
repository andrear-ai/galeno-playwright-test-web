import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { users } from '../data/users';
import { esperarCarga } from '../utils/waits';

test.setTimeout(180000);

test('medicamentos - flujo básico', async ({ page }) => {
  const user = users.find(u => u.tipo === 'azul');
  if (!user) throw new Error('Usuario azul no encontrado');

  const loginPage = new LoginPage(page);

  await test.step('Login y navegar a Medicamentos', async () => {
    await page.goto('https://portal-test.galeno.com.ar/login/');
    await loginPage.login(user.dni, user.password);
    await page.waitForURL('**/socio/home', { timeout: 60000 });
    await page.getByRole('button', { name: 'Medicamentos' }).waitFor({ state: 'visible', timeout: 60000 });
    await page.getByRole('button', { name: 'Medicamentos' }).click();
    await page.waitForURL('**/socio/medicamentos', { timeout: 90000 });
    await esperarCarga(page);
  });

  // Iniciar un nuevo trámite - Botón "+"
await test.step('Iniciar nuevo trámite', async () => {

  const nuevoTramiteButton = page.locator(
    'button:has(svg[data-testid="AddIcon"])'
  );

  await expect(nuevoTramiteButton).toBeVisible({
    timeout: 60000
  });

  try {
    await nuevoTramiteButton.click();
  } catch {
    await nuevoTramiteButton.click({ force: true });
  }

  await esperarCarga(page);

  // Debug
  await page.screenshot({
    path: 'despues-click-mas.png',
    fullPage: true
  });

  console.log('URL actual:', page.url());

  // Verificar que realmente se abrió el formulario
  const findByLabels = async (labels: (string | RegExp)[]) => {
    for (const l of labels) {
      const loc = page.getByLabel(l as any);
      if ((await loc.count()) > 0) return loc;
    }
    // fallback: intentar por id o nombre conteniendo 'area'
    const fallback = page.locator('input[id*="area" i], input[name*="area" i]').first();
    return fallback;
  };

  const nroArea = await findByLabels([/N.?°?.*Área/i, /Nro.*Área/i, /N.?°?.*Area/i]);

  await expect(nroArea).toBeVisible({ timeout: 30000 });

});
// Modal de información sobre documentación requerida
  await test.step('Aceptar modal', async () => {

    const modal = page.getByText(
        'Recordá que necesitas tener a mano la documentación'
    );

    if (await modal.isVisible()) {

        await page.locator('p', {
            hasText: 'ACEPTAR'
        }).click();

        await esperarCarga(page);
    }

});

  await test.step('Seleccionar Medicamentos Especiales', async () => {
    const card = page.getByText('Medicamentos especiales').first();
    await card.waitFor({ state: 'visible', timeout: 30000 });
    await card.click();
    await esperarCarga(page);
  });
    
  await test.step('Completar Paso 1 (datos de contacto)', async () => {
    const nroArea = await findByLabels([/N.?°?.*Área/i, /Nro.*Área/i, /N.?°?.*Area/i]);
    await expect(nroArea).toBeVisible({ timeout: 15000 });

    await nroArea.fill('011');
    // Teléfono label puede ser 'Teléfono' o 'Teléfono fijo' — intentar ambas
    const telefono = page.getByLabel(/Tel[ií]fono/i).first();
    if ((await telefono.count()) > 0) await telefono.fill('59263547');
    const emailField = page.getByLabel(/E-?mail|Email|Correo/i).first();
    if ((await emailField.count()) > 0) await emailField.fill('pruebaautomation@gmail.com');

    await page.screenshot({ path: 'paso1.png', fullPage: true });

    // Buscar botón Continuar con varias estrategias
    const candidates = [
      page.locator('#btnContinuar'),
      page.getByRole('button', { name: /^continuar$/i }).first(),
      page.locator('button', { hasText: /continuar/i }).first(),
    ];

    let clicked = false;
    for (const cand of candidates) {
      try {
        if ((await cand.count()) === 0) continue;
        await cand.waitFor({ state: 'visible', timeout: 15000 });
        await expect(cand).toBeEnabled({ timeout: 15000 });
        await cand.click();
        clicked = true;
        break;
      } catch (e) {
        // intentar siguiente candidato
      }
    }
    if (!clicked) {
      const anyBtn = page.locator('button', { hasText: /continuar/i }).first();
      if ((await anyBtn.count()) > 0) {
        await anyBtn.click({ force: true }).catch(() => {});
        clicked = true;
      }
    }
    if (!clicked) throw new Error('No se pudo encontrar ni clicar el botón Continuar en Paso 1');
    await esperarCarga(page);
  });

  await test.step('Paso 2 - Cargar documentación', async () => {
    const inputs = page.locator('input[type="file"]');
    try {
      await expect(inputs).toHaveCount(2, { timeout: 60000 });
    } catch (e) {
      // fallback: click first card and retry
      const card = page.getByText('Medicamentos especiales').first();
      if ((await card.count()) > 0) {
        await card.click({ force: true }).catch(() => {});
        await esperarCarga(page);
      }
      await expect(inputs).toHaveCount(2, { timeout: 60000 });
    }

    await inputs.nth(0).setInputFiles('./fixtures/orden-medica.pdf');
    await inputs.nth(1).setInputFiles('./fixtures/informacion-adicional.jpg');

    await expect(page.getByText('orden-medica.pdf')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('informacion-adicional.jpg')).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'paso2-documentacion.png', fullPage: true });
    const continuar2 = page.getByRole('button', { name: /continuar/i }).first();
    await expect(continuar2).toBeEnabled({ timeout: 15000 });
    await continuar2.click();
    await esperarCarga(page);
  });

  await test.step('Paso 3 - Confirmación', async () => {
    const comentariosInput = page.getByLabel('Dejanos un comentario adicional');
    if ((await comentariosInput.count()) > 0) {
      await comentariosInput.fill('Prueba automatizada QA - comentario');
    }
    const confirmar = page.getByRole('button', { name: /confirmar/i }).first();
    await expect(confirmar).toBeEnabled({ timeout: 15000 });
    await confirmar.click();
    await expect(page.getByText(/Medicamento|tramite se creo/i)).toBeVisible({ timeout: 80000 });
  });
});
