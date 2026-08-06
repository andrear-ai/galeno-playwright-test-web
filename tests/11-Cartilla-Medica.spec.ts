import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { users } from '../data/users';
import { esperarCarga } from '../utils/waits';

test.setTimeout(120000);

//=========================================================
// Función para agregar a favoritos desde el listado
//=========================================================

async function agregarFavorito(page: Page) {
  const card = page.locator('#DireccionCard-0');

  await expect(card).toBeVisible();

  await card.locator('svg[data-icon="heart"]').click();

  const snackbar = page.getByRole('alert').first();

  await expect(snackbar).toBeVisible();

  await expect(snackbar).toContainText(
    /Se agreg[oó] a favoritos|Ya tenés este prestador guardado en favoritos/
  );
}

//=========================================================
// Función para agregar a favoritos desde Ver Equipo Médico y Validar snackbar
//=========================================================

async function agregarFavoritoEquipoMedico(page: Page) {
  const corazon = page.locator('svg[data-icon="heart"]').first();

  await expect(corazon).toBeVisible();

  await corazon.click();

  const snackbar = page.getByRole('alert').first();

  await expect(snackbar).toBeVisible();

  await expect(snackbar).toContainText(
    /Se agreg[oó] a favoritos|Ya tenés este prestador guardado en favoritos/
  );
}

test('Cartilla Medica - flujo completo', async ({ page }) => {

  // Usuario Azul
  const user = users.find(u => u.tipo === 'azul');
  if (!user) throw new Error('Usuario azul no encontrado');

  const loginPage = new LoginPage(page);

  // 1. Ir a la URL de login
  await page.goto('https://portal-test.galeno.com.ar/login/');

  // 2. Loguearse con usuario Azul
  await loginPage.login(user.dni, user.password);

  // 3. Esperar a que cargue la home
  await page.waitForURL('**/socio/home', { timeout: 60000 });

  // 4. Tomar screenshot de la home para verificar
  await page.screenshot({
    path: 'home-screenshot.png',
    fullPage: true
  });

  // 5. Ingresar a Cartilla Médica
  const cartillaElement = page.getByRole('button', {
    name: 'Cartilla Médica'
  });

  await cartillaElement.waitFor({
    state: 'visible',
    timeout: 60000
  });

  await cartillaElement.click();

  //=========================================================
  // 1. Buscar por Especialidad / Rubro
  //=========================================================

  await page.locator('#bucador-especialidad').click();
  await page.locator('#bucador-especialidad').fill('Clínica Medica');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.getByRole('button', {
    name: /^Buscar$/
  }).click();

  await esperarCarga(page);

  await agregarFavorito(page);

  //=========================================================
  // 2. Buscar por Profesional
  //=========================================================

  await page.locator('#component-outlinedProfesional').fill('Gomez');

  await page.getByRole('button', {
    name: /^Buscar$/
  }).click();

  await esperarCarga(page);

  await agregarFavorito(page);

  //=========================================================
  // 3. Buscar por Provincia / Zona / Localidad
  //=========================================================

  await page.locator('#bucador-barrio').click();
  await page.locator('#bucador-barrio').fill('Buenos Aires');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.getByRole('button', {
    name: /^Buscar$/
  }).click();

  await esperarCarga(page);

  await agregarFavorito(page);

  //=========================================================
  // 4. Buscar utilizando todos los filtros
  //=========================================================

  await page.locator('#bucador-especialidad').fill('Clínica Medica');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.locator('#component-outlinedProfesional').fill('Gomez');

  await page.locator('#bucador-barrio').fill('Buenos Aires');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.getByRole('button', {
    name: /^Buscar$/
  }).click();

  await esperarCarga(page);

  const card = page.locator('#DireccionCard-0');
  await expect(card).toBeVisible();

  //=========================================================
// 5. Nueva búsqueda Dermatología
//=========================================================

// Ir nuevamente a la home de Cartilla Médica
await page.getByRole('button', {
  name: 'Cartilla Médica'
}).click();

await esperarCarga(page);

// Especialidad: Dermatología
await page.locator('#bucador-especialidad').click();
await page.locator('#bucador-especialidad').fill('Dermatología');

await page.keyboard.press('ArrowDown');
await page.keyboard.press('Enter');

// Profesional
await page.locator('#component-outlinedProfesional')
  .fill('Gonzalez'); // colocar aquí el profesional requerido

// Provincia: Capital Federal
await page.locator('#bucador-barrio').click();
await page.locator('#bucador-barrio')
  .fill('Capital Federal');

await page.keyboard.press('ArrowDown');
await page.keyboard.press('Enter');

// Buscar
await page.getByRole('button', {
  name: /^Buscar$/
}).click();

await esperarCarga(page);

// Agregar favorito y validar snackbar
await agregarFavorito(page);

///=========================================================
// 6. Volver a Cartilla Médica y Buscar por Especialidad / Rubro Alergia
//=========================================================

await page.getByRole('button', {
  name: 'Cartilla Médica'
}).click();

await esperarCarga(page);

// Especialidad / Rubro
await page.locator('#bucador-especialidad').click();
await page.locator('#bucador-especialidad').fill('Alergia');

await page.keyboard.press('ArrowDown');
await page.keyboard.press('Enter');

// Buscar
await page.getByRole('button', {
  name: /^Buscar$/
}).click();

await esperarCarga(page);

// Ordenar por Cercanía
const ordenCercania = page.locator('input[type="checkbox"]');

if (!(await ordenCercania.isChecked())) {
  await ordenCercania.check();
}

await esperarCarga(page);

// Ver Equipo Médico
await page.getByText('Ver Equipo Médico', { exact: true }).first().click();

await esperarCarga(page);
// Agregar a favoritos desde Ver Equipo Médico y validar snackbar

async function agregarFavoritoEquipoMedico(page: Page) {

  const corazon = page.locator('svg[data-icon="heart"]').first();

  await expect(corazon).toBeVisible({
    timeout: 10000
  });

  await corazon.click();

  const snackbar = page.getByRole('alert').first();

  await expect(snackbar).toBeVisible({
    timeout: 10000
  });

  await expect(snackbar).toContainText(
    /Se agreg[oó] a favoritos|Ya tenés este prestador guardado en favoritos/,
    { timeout: 10000 }
  );

  // Volver
  await page.getByText('Volver', { exact: true }).click();

  await esperarCarga(page);
}

///=========================================================
// 7. Volver a Cartilla Home y descargar PDF
//=========================================================

await page.getByRole('button', {
  name: 'Cartilla Médica'
}).click();

await esperarCarga(page);

// Abrir modal descarga
await page.getByRole('button', {
  name: /DESCARGA TU CARTILLA/i
}).click();

// Validar modal visible
await expect(
  page.getByRole('dialog', {
    name: /Descarga las cartillas/i
  })
).toBeVisible();

const cartillas = page.getByRole('dialog').getByRole('button');

await expect(cartillas).toHaveCount(3); // 2 descargas + SALIR


// Primera descarga REGIÓN AMBA AZUL
const primeraCartilla = page.getByRole('button', {
  name: /REGIÓN AMBA AZUL/i
});

const [download1] = await Promise.all([
  page.waitForEvent('download'),
  primeraCartilla.click()
]);

expect(download1.suggestedFilename()).toMatch(/\.pdf$/i);


// Segunda descarga ODONTOLOGIA AZUL Y BLANCO
const segundaCartilla = page.getByRole('button', {
  name: /ODONTOLOGIA AZUL Y BLANCO/i
});

const [download2] = await Promise.all([
  page.waitForEvent('download'),
  segundaCartilla.click()
]);

expect(download2.suggestedFilename()).toMatch(/\.pdf$/i);


// Salir del modal
await page.getByRole('button', {
  name: 'SALIR'
}).click();

await expect(
  page.getByRole('dialog', {
    name: /Descarga las cartillas/i
  })
).not.toBeVisible();

});



