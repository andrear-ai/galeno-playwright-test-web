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



    await test.step('Ingresar a Sanatorios propios', async () => {


        const sanatoriosMenu = page.getByRole('button', {
            name: 'Sanatorios',
            exact: true
        });



        await expect(sanatoriosMenu).toBeVisible({
            timeout: 60000
        });



        await sanatoriosMenu.click();



        await esperarCarga(page);


        // Validamos que cargó el listado de sanatorios

        await expect(
    page.getByRole('heading', {
        name: /Sanatorio de la Trinidad Neuquen/i
    })
    ).toBeVisible({
    timeout: 90000
    });


    });



    const sanatorios = [
    {
        card: 'Sanatorio de la Trinidad Neuquen',
        detalle: 'Sanatorio de la Trinidad Neuquén'
    },
    {
        card: 'Sanatorio de la Trinidad Palermo',
        detalle: 'Sanatorio de la Trinidad Palermo'
    },
    {
        card: 'Sanatorio de la Trinidad Mitre',
        detalle: 'Sanatorio de la Trinidad Mitre'
    },
    {
        card: 'Sanatorio de la Trinidad Quilmes',
        detalle: 'Sanatorio de la Trinidad Quilmes'
    },
    {
        card: 'Sanatorio de la Trinidad San Isidro - Thames',
        detalle: 'Sanatorio de la Trinidad San Isidro | Sede Thames'
    },
    {
        card: 'Sanatorio de la Trinidad San Isidro - Fleming',
        detalle: 'Sanatorio de la Trinidad San Isidro | Sede Fleming'
    },
    {
        card: 'Sanatorio de la Trinidad Ramos Mejía',
        detalle: 'Sanatorio de la Trinidad Ramos Mejía'
    },
    {
        card: 'Sanatorio Dupuytren',
        detalle: 'Sanatorio Dupuytren'
    }
];


    await test.step('Recorrer todos los Sanatorios Propios', async () => {



        for (const sanatorio of sanatorios) {



            await test.step(`Ingresar a ${sanatorio.card}`, async () => {



                const cardSanatorio = page.getByRole('heading', {
                    name: sanatorio.card,
                    exact: true
                });



                await expect(cardSanatorio).toBeVisible({
                    timeout: 60000
                });



                await cardSanatorio.click();


                await esperarCarga(page);



                // Esperar que desaparezca loader si existe

                await expect(
                    page.locator('[role="progressbar"]')
                ).toHaveCount(0, {
                    timeout: 90000
                });



                // Validar información del detalle

                await expect(
                    page.locator('#toTopPage')
                ).toContainText(
                    sanatorio.detalle,
                    {
                        timeout: 90000
                    }
                );



                console.log(
                    `Ingresó correctamente a: ${sanatorio.card}`
                );




                await page.goBack({
                    waitUntil: 'domcontentloaded'
                });



                await esperarCarga(page);



                // Validar regreso al listado

                await expect(
                    page.getByRole('heading', {
                        name: 'Sanatorio de la Trinidad Neuquen',
                        exact: true
                    })
                ).toBeVisible({
                    timeout: 90000
                });



            });



        }



    });



});