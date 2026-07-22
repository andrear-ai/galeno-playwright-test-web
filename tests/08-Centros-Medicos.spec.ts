import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { users } from '../data/users';
import { esperarCarga } from '../utils/waits';

test.setTimeout(180000);

test('Centros Medicos - flujo básico', async ({ page }) => {

    const user = users.find(u => u.tipo === 'azul');
    if (!user) throw new Error('Usuario azul no encontrado');

    const loginPage = new LoginPage(page);


    await test.step('Login y navegar a Centros Médicos Propios', async () => {

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


    await test.step('Ingresar a Nuestros Sanatorios', async () => {

        const nuestrosSanatorios = page.getByText(
            'Nuestros Sanatorios',
            { exact: true }
        );

        await expect(nuestrosSanatorios).toBeVisible({
            timeout: 60000
        });

        await nuestrosSanatorios.click();

        await esperarCarga(page);

    });


    await test.step('Ingresar a Centros Médicos Propios', async () => {

        const centrosPropios = page.getByRole('menuitem', {
            name: 'Centros Médicos propios'
        });

        await expect(centrosPropios).toBeVisible({
            timeout: 60000
        });

        await centrosPropios.click();


        // Validamos que realmente cargó la pantalla de Centros Médicos
        await expect(
            page.getByRole('heading', {
                name: 'Trinidad Medical Center Palermo'
            })
        ).toBeVisible({
            timeout: 90000
        });


        await esperarCarga(page);

    });


    await test.step('Recorrer todos los Centros Médicos', async () => {

        const centros = [
            'Trinidad Medical Center Palermo',
            'Trinidad Medical Center Mitre',
            'Centro médico Trinidad Quilmes',
            'Trinidad Medical Center San Isidro',
            'Centro médico Trinidad San Isidro Fleming',
            'Centro médico Trinidad Ramos Mejía',
            'Centro médico Trinidad Barrio Norte',
            'Consultorios externos Dupuytren'
        ];


        for (const centro of centros) {

            await test.step(`Ingresar a ${centro}`, async () => {


                const cardCentro = page.getByRole('heading', {
                    name: centro,
                    exact: true
                });


                await expect(cardCentro).toBeVisible({
                    timeout: 60000
                });


                await cardCentro.click();


                await esperarCarga(page);


                console.log(`Ingresó correctamente a: ${centro}`);


                await page.goBack();


                await expect(
                    page.getByRole('heading', {
                        name: 'Trinidad Medical Center Palermo'
                    })
                ).toBeVisible({
                    timeout: 60000
                });


            });

        }

    });

});