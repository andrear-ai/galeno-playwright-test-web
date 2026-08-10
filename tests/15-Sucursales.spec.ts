import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { users } from '../data/users';
import { esperarCarga } from '../utils/waits';

test.setTimeout(450000);

test('Sucursales - recorrer todas las provincias y sus sucursales haciendo click', async ({ page }) => {

    const user = users.find(u => u.tipo === 'azul');

    if (!user) {
        throw new Error('Usuario azul no encontrado');
    }

    const loginPage = new LoginPage(page);

    const URL_SUCURSALES =
        'https://portal-test.galeno.com.ar/socio/sucursales';


    await test.step('Login', async () => {

        await page.goto(
            'https://portal-test.galeno.com.ar/login/'
        );

        await loginPage.login(
            user.dni,
            user.password
        );

        await page.waitForURL('**/socio/home', {
            timeout: 60000
        });

        await esperarCarga(page);

    });


    // =========================================================
    // INGRESAR A SUCURSALES (MENÚ LATERAL)
    // =========================================================

    await test.step('Ingresar a Sucursales desde el menú lateral', async () => {

        const opcionSucursales =
            page.getByRole('navigation')
                .getByRole('button', { name: 'Sucursales' })
                .or(
                    page.getByRole('navigation')
                        .getByRole('link', { name: 'Sucursales' })
                ).first();


        await expect(
            opcionSucursales
        ).toBeVisible({
            timeout: 60000
        });


        await opcionSucursales.click();


        await page.waitForURL('**/socio/sucursales', {
            timeout: 60000
        });


        await esperarCarga(page);


        await expect(
            page.locator('#toTopPage')
        ).toBeVisible({
            timeout: 60000
        });

    });


    // =========================================================
    // OBTENER LISTADO DE TODAS LAS PROVINCIAS
    // =========================================================

    let provinciasLimpias: string[] = [];

    await test.step('Obtener lista de provincias', async () => {

        const selectProvincia =
            page.locator('#toTopPage').getByRole('combobox').first()
                .or(page.locator('#toTopPage [class*="MuiSelect"]').first())
                .or(page.locator('select').first());


        await expect(
            selectProvincia
        ).toBeVisible({
            timeout: 60000
        });


        // Abrir selector
        await selectProvincia.click();


        const opcionesLocator =
            page.getByRole('option')
                .or(page.locator('[role="option"]'))
                .or(page.locator('li[data-value]'));


        await expect(
            opcionesLocator.first()
        ).toBeVisible({
            timeout: 60000
        });


        const provincias =
            await opcionesLocator.allInnerTexts();


        provinciasLimpias =
            provincias
                .map(p => p.trim())
                .filter(p => p.length > 0 && !p.toLowerCase().includes('seleccio'));


        console.log(
            '========================================'
        );

        console.log(
            `Provincias encontradas: ${provinciasLimpias.length}`
        );

        console.log(
            '========================================'
        );


        if (
            provinciasLimpias.length === 0
        ) {

            throw new Error(
                'No se encontraron provincias en el desplegable.'
            );

        }


        // Cerrar menú desplegable inicial
        await page.keyboard.press('Escape');

    });


    // =========================================================
    // RECORRER PROVINCIA POR PROVINCIA
    // =========================================================

    for (
        let provinciaIndex = 0;
        provinciaIndex < provinciasLimpias.length;
        provinciaIndex++
    ) {

        const nombreProvincia =
            provinciasLimpias[provinciaIndex];


        await test.step(
            `Provincia ${provinciaIndex + 1}: ${nombreProvincia}`,
            async () => {


                console.log(
                    '========================================'
                );

                console.log(
                    `SELECCIONANDO PROVINCIA: ${nombreProvincia}`
                );

                console.log(
                    '========================================'
                );


                // 1. Abrir desplegable
                const selectProvincia =
                    page.locator('#toTopPage').getByRole('combobox').first()
                        .or(page.locator('#toTopPage [class*="MuiSelect"]').first())
                        .or(page.locator('select').first());


                await selectProvincia.click();


                // 2. Buscar y seleccionar la provincia actual
                const opcionProvincia =
                    page.getByRole('option', {
                        name: nombreProvincia,
                        exact: true
                    }).or(
                        page.locator('[role="option"]').filter({
                            hasText: nombreProvincia
                        })
                    ).first();


                await expect(
                    opcionProvincia
                ).toBeVisible({
                    timeout: 60000
                });


                await opcionProvincia.click();


                // Forzar cierre del popover desplegable si permaneciera visible
                await page.keyboard.press('Escape').catch(() => {});


                await esperarCarga(page);


                // Pausa breve al cargar la provincia (1.5 segundos)
                await page.waitForTimeout(1500);


                // =====================================================
                // IDENTIFICAR Y RECORRER CARDS UNICAS DE LA PROVINCIA
                // =====================================================

                // Usamos selector estricto de la tarjeta individual
                const tarjetasSucursales =
                    page.locator('#toTopPage [class*="cardSucursal"]')
                        .or(page.locator('#toTopPage [class*="MuiCard-root"]'));


                const cantidadTotal =
                    await tarjetasSucursales.count();


                // Filtramos elementos visibles y evitamos duplicados por nombre
                const sucursalesProcesadas = new Set<string>();
                const indicesValidos: number[] = [];

                for (let i = 0; i < cantidadTotal; i++) {
                    const card = tarjetasSucursales.nth(i);
                    
                    if (await card.isVisible()) {
                        const texto = await card.innerText();
                        const nombreLimpio = texto.split('\n')[0].trim();

                        if (nombreLimpio && !sucursalesProcesadas.has(nombreLimpio)) {
                            sucursalesProcesadas.add(nombreLimpio);
                            indicesValidos.push(i);
                        }
                    }
                }


                console.log(
                    `Sucursales encontradas en ${nombreProvincia}: ${indicesValidos.length}`
                );


                if (
                    indicesValidos.length > 0
                ) {

                    // Recorremos las sucursales únicas identificadas
                    for (
                        let i = 0;
                        i < indicesValidos.length;
                        i++
                    ) {

                        const index = indicesValidos[i];
                        const sucursalCard = tarjetasSucursales.nth(index);


                        await sucursalCard.scrollIntoViewIfNeeded();


                        const textoSucursal =
                            await sucursalCard.innerText();


                        const nombreSucursal =
                            textoSucursal.split('\n')[0].trim();


                        console.log(
                            `  -> [Card ${i + 1}/${indicesValidos.length}] Click en: ${nombreSucursal}`
                        );


                        // Click único en la card para mover/centrar el mapa
                        await sucursalCard.click({ force: true });


                        // Pausa de 1.5 segundos por card
                        await page.waitForTimeout(1500);

                    }

                } else {

                    console.log(
                        `  -> No se encontraron tarjetas de sucursales para ${nombreProvincia}.`
                    );

                    await page.waitForTimeout(1500);

                }

            }
        );

    }


    // =========================================================
    // LIMPIAR BÚSQUEDA AL FINALIZAR
    // =========================================================

    await test.step('Limpiar la búsqueda', async () => {

        console.log(
            '========================================'
        );

        console.log(
            'Limpiando búsqueda...'
        );

        console.log(
            '========================================'
        );


        const botonLimpiar =
            page.getByRole('button', { name: /limpiar|clear|borrar/i })
                .or(page.locator('button[aria-label*="clear" i]'))
                .or(page.locator('button[aria-label*="limpiar" i]'))
                .or(page.locator('button:has-text("Limpiar")'))
                .or(page.locator('button:has-text("Clear")'))
                .first();


        if (
            await botonLimpiar.isVisible()
        ) {

            await botonLimpiar.click();


            await esperarCarga(page);


            await page.waitForTimeout(1500);


            console.log(
                '✓ Búsqueda limpiada correctamente.'
            );

        }


        console.log(
            '✓ Test finalizado exitosamente.'
        );

    });

});