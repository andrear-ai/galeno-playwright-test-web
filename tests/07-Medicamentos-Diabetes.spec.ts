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

        await loginPage.login(
            user.dni,
            user.password
        );

        await page.waitForURL('**/socio/home', {
            timeout: 90000
        });

        const medicamentos = page.getByRole('button', {
            name: 'Medicamentos'
        });

        await expect(medicamentos).toBeVisible({
            timeout: 90000
        });

        await medicamentos.click();

        await page.waitForURL('**/socio/medicamentos', {
            timeout: 90000
        });

        await esperarCarga(page);

    });


    await test.step('Iniciar nuevo trámite', async () => {

        const nuevoTramiteButton = page.locator(
            'button:has(svg[data-testid="AddIcon"])'
        );

        await expect(nuevoTramiteButton).toBeVisible({
            timeout: 90000
        });

        await nuevoTramiteButton.click();

        await esperarCarga(page);

        console.log('URL actual:', page.url());

        await page.screenshot({
            path: 'despues-click-mas.png',
            fullPage: true
        });

    });


    await test.step('Aceptar modal', async () => {

    const modal = page.getByText(
        /Recordá que necesitas tener a mano/i
    );

    await expect(modal).toBeVisible({
        timeout: 15000
    });

    const aceptar = page.locator(
        'p',
        { hasText: /^ACEPTAR$/ }
    );

    await aceptar.click();

    await expect(modal).toBeHidden({
        timeout: 10000
    });

    await esperarCarga(page);

});

    await test.step('Diabetes', async () => {

        const spinner = page.getByRole('progressbar');

        if (await spinner.count() > 0) {

            await spinner.waitFor({
                state: 'hidden',
                timeout: 30000
            });

        }

        const card = page
            .getByText(/Diabetes/i)
            .first();

        await expect(card).toBeVisible({
            timeout: 30000
        });

        await card.click();

        await esperarCarga(page);

    });

    // Paso 1 - Creación
    await test.step('Creación', async () => {

        await expect(
            page.getByText('Creación')
        ).toBeVisible({
            timeout: 30000
        });

        const nroAreaInput = page.getByRole('textbox', {
            name: 'Nro. Área'
        });

        await expect(nroAreaInput).toBeVisible({
            timeout: 30000
        });

        await nroAreaInput.fill('111');


        await page.getByRole('textbox', {
            name: 'Teléfono'
        }).fill('123456789');


        await page.getByRole('textbox', {
            name: 'Email'
        }).fill('prueba@gmail.com');


        await page.screenshot({
            path: 'paso1.png',
            fullPage: true
        });


        const continuar = page.getByRole('button', {
            name: /CONTINUAR/i
        });

        await expect(continuar).toBeEnabled();

        await continuar.click();

        await esperarCarga(page);

    });

    // Paso 2 - Documentación
    await test.step('Paso 2 - Documentación', async () => {

        const inputs = page.locator(
            'input[type="file"]'
        );

        await expect(inputs).toHaveCount(2);


        await inputs.nth(0).setInputFiles(
            './fixtures/orden-medica.pdf'
        );


        await inputs.nth(1).setInputFiles(
            './fixtures/informacion-adicional.jpg'
        );


        await expect(
            page.getByText('orden-medica.pdf')
        ).toBeVisible();


        await expect(
            page.getByText('informacion-adicional.jpg')
        ).toBeVisible();


        const continuar = page.getByRole('button', {
            name: /CONTINUAR/i
        });

        await expect(continuar).toBeEnabled();

        await continuar.click();

        await esperarCarga(page);

    });

    // Paso 3 - Confirmación
    await test.step('Paso 3 - Confirmación', async () => {

        await expect(
            page.getByRole('button', {
                name: 'Confirmación'
            })
        ).toBeVisible({
            timeout: 60000
        });


        const comentarios = `Prueba automatizada QA.
Texto con símbolos:
@#%&*()_+-=[]{}|;:,.<>/?`;


        const comentariosInput = page.getByLabel(
            'Dejanos un comentario adicional'
        );

        await expect(
            comentariosInput
        ).toBeVisible();

        await comentariosInput.fill(
            comentarios
        );

        expect(
            await comentariosInput.inputValue()
        ).toContain(
            'Prueba automatizada QA'
        );


        await page.screenshot({
            path: 'paso3-comentarios.png',
            fullPage: true
        });


        const confirmarButton = page.getByRole('button', {
            name: /confirmar/i
        });

        await expect(
            confirmarButton
        ).toBeEnabled();

        await confirmarButton.click();


        await expect(
            page.getByText(
                'Tu tramite se creo con exito'
            )
        ).toBeVisible({
            timeout: 80000
        });

    });

});