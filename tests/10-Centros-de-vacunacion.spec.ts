import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { users } from '../data/users';
import { esperarCarga } from '../utils/waits';

test.setTimeout(180000);

test('Centros Vacunación - flujo básico', async ({ page }) => {

    const user = users.find(u => u.tipo === 'azul');
    if (!user) throw new Error('Usuario azul no encontrado');

    const loginPage = new LoginPage(page);

    await test.step('Login y navegar a Centros de Vacunación', async () => {

        await page.goto('https://portal-test.galeno.com.ar/login/');

        await loginPage.login(
            user.dni,
            user.password
        );

        await page.waitForURL('**/socio/home', {
            timeout: 60000
        });

        await esperarCarga(page);

    });


    await test.step('Ingresar a Centros de Vacunación desde Header', async () => {

    // Abrir menú del header
    const menuCentros = page.getByRole('button', {
        name: 'Nuestros Sanatorios'
    });

    await expect(menuCentros).toBeVisible({
        timeout: 60000
    });

    await menuCentros.click();


    // Esperar opción Centros de Vacunación
    const centrosVacunacion = page.locator(
        '#menu-centros-vacunacion > div > div > div > span'
    );

    await expect(centrosVacunacion).toBeVisible({
        timeout: 60000
    });


    await centrosVacunacion.click();

    await esperarCarga(page);


    await expect(
        page.getByText(
            'Calendario Nacional de Vacunación',
            {
                exact: true
            }
        )
    ).toBeVisible({
        timeout: 90000
    });

});


});