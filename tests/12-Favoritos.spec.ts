import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { users } from '../data/users';
import { esperarCarga } from '../utils/waits';

test.setTimeout(180000);

//=========================================================
// Función para eliminar favoritos desde pantalla Favoritos
//=========================================================

async function eliminarFavoritos(page: Page, cantidad: number) {

  for (let i = 0; i < cantidad; i++) {

    const card = page.locator('[id^="DireccionCard"]').first();

    await expect(card).toBeVisible({
      timeout: 10000
    });


    const nombrePrestador = await card.locator('p').first().innerText();


    // Quitar favorito (corazón azul)
    await card.locator('svg[data-icon="heart"]').click();


    // Validar snackbar
    const snackbar = page.getByRole('alert').first();

    await expect(snackbar).toBeVisible({
      timeout: 10000
    });


    await expect(snackbar).toContainText(
      /Se eliminó de favoritos/i
    );


    // Validar que la card desaparece
    await expect(
      page.getByText(nombrePrestador, {
        exact: true
      })
    ).not.toBeVisible({
      timeout: 10000
    });


    await esperarCarga(page);

  }
}

//=========================================================
// Test Favoritos
//=========================================================

test('Favoritos - flujo básico', async ({ page }) => {

    const user = users.find(u => u.tipo === 'azul');

    if (!user) {
      throw new Error('Usuario azul no encontrado');
    }


    const loginPage = new LoginPage(page);

    //=========================================================
    // 1. Login
    //=========================================================

    await page.goto(
      'https://portal-test.galeno.com.ar/login/'
    );


    await loginPage.login(
        user.dni,
        user.password
    );


    await page.waitForURL(
        '**/socio/home',
        {
          timeout: 60000
        }
    );


    await esperarCarga(page);

    //=========================================================
    // 2. Ingresar a Favoritos desde Header
    //=========================================================

    const favoritosHeader = page.locator(
      'svg[data-icon="heart"]'
    ).first();


    await expect(favoritosHeader).toBeVisible({
      timeout: 10000
    });

    await favoritosHeader.click();


    await esperarCarga(page);

    //=========================================================
    // 3. Validar pantalla Favoritos
    //=========================================================

    await expect(
      page.getByRole('heading', {
        name: 'Favoritos'
      })
    ).toBeVisible({
      timeout: 10000
    });

    //=========================================================
    // 4. Eliminar favoritos
    //=========================================================

    await eliminarFavoritos(page, 2);


});

