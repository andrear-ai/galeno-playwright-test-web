import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { users } from '../data/users';
import { esperarCarga } from '../utils/waits';

test.setTimeout(180000);

test('Beneficios - recorrer categorías y cards específicas', async ({ page }) => {

    const user = users.find(u => u.tipo === 'azul');

    if (!user) {
        throw new Error('Usuario azul no encontrado');
    }

    const loginPage = new LoginPage(page);

    const URL_LOGIN =
        'https://portal-test.galeno.com.ar/login/';

    const URL_BENEFICIOS =
        'https://portal-test.galeno.com.ar/socio/clubBeneficios';

    const URL_OPTICAS =
        'https://portal-test.galeno.com.ar/socio/clubBeneficios/opticas';

    const URL_DEPORTES =
        'https://portal-test.galeno.com.ar/socio/clubBeneficios/deportes';

    const URL_ESTETICA =
        'https://portal-test.galeno.com.ar/socio/clubBeneficios/estetica';

    const URL_COMPRAS =
        'https://portal-test.galeno.com.ar/socio/clubBeneficios/compras';


    // =========================================================
    // FUNCIÓN: VOLVER A HOME DE BENEFICIOS
    // =========================================================

    async function volverABeneficios() {

        console.log('');
        console.log('→ Volviendo a Home de Beneficios...');

        await page.goto(URL_BENEFICIOS, {
            waitUntil: 'domcontentloaded'
        });

        await esperarCarga(page);

        await expect(
            page.getByText('Beneficios Destacados', {
                exact: true
            })
        ).toBeVisible({
            timeout: 60000
        });

        console.log('✓ Home de Beneficios cargada');

    }


    // =========================================================
    // FUNCIÓN: INGRESAR A UNA CATEGORÍA
    // =========================================================

    async function ingresarCategoria(
        nombreCategoria: string,
        urlCategoria: string
    ) {

        console.log('');
        console.log('========================================');
        console.log(`→ Categoría: ${nombreCategoria}`);
        console.log('========================================');

        // Asegurarse de estar en Home de Beneficios

        if (page.url() !== URL_BENEFICIOS) {
            await volverABeneficios();
        }

        // Buscar texto exacto de la categoría

        const categoriaTexto = page
            .getByText(nombreCategoria, {
                exact: true
            })
            .last();

        await expect(
            categoriaTexto
        ).toBeVisible({
            timeout: 60000
        });

        await categoriaTexto.scrollIntoViewIfNeeded();

        console.log(
            `✓ Categoría encontrada: ${nombreCategoria}`
        );

        // Buscar la card contenedora

        const categoriaCard = categoriaTexto.locator(
            'xpath=ancestor::div[contains(@class, "cardCategorias")][1]'
        );

        await expect(
            categoriaCard
        ).toBeVisible({
            timeout: 60000
        });

        console.log(
            '✓ Card de categoría encontrada'
        );

        // Click sobre la card completa

        await categoriaCard.click();

        // Esperar URL

        await page.waitForURL(
            urlCategoria,
            {
                timeout: 60000
            }
        );

        await esperarCarga(page);

        console.log(
            `✓ Categoría abierta: ${nombreCategoria}`
        );

        console.log(
            `✓ URL: ${page.url()}`
        );

    }


    // =========================================================
    // FUNCIÓN: VALIDAR Y ABRIR CARD
    // =========================================================

    async function validarCard(
        nombreCard: string
    ) {

        console.log('');
        console.log('----------------------------------------');
        console.log(`→ Buscando card: ${nombreCard}`);
        console.log('----------------------------------------');

        /*
         * Buscamos directamente el contenedor MuiCard-root
         * que contenga el texto.
         *
         * Esto es más robusto que:
         *
         * getByText(...)
         *
         * porque el texto visual puede aparecer truncado
         * con "..." pero el contenido de la card sigue
         * estando dentro del DOM.
         */

        const card = page
            .locator('div.MuiCard-root')
            .filter({
                hasText: nombreCard
            })
            .first();

        await expect(
            card
        ).toBeVisible({
            timeout: 60000
        });

        await card.scrollIntoViewIfNeeded();

        console.log(
            `✓ Card encontrada: ${nombreCard}`
        );

        // =====================================================
        // OBTENER TEXTO REAL DE LA CARD
        // =====================================================

        const textoCard = (
            await card.innerText()
                .catch(() => '')
        ).trim();

        console.log(
            `✓ Texto de la card: ${textoCard}`
        );

        // =====================================================
        // CLICK EN LA CARD
        // =====================================================

        await card.click();

        console.log(
            `✓ Click realizado sobre: ${nombreCard}`
        );

        // =====================================================
        // ESPERAR CARGA
        // =====================================================

        await page.waitForTimeout(1500);

        await esperarCarga(page);

        console.log(
            `✓ Card abierta: ${nombreCard}`
        );

        console.log(
            `✓ URL actual: ${page.url()}`
        );

    }


    // =========================================================
    // LOGIN
    // =========================================================

    await test.step(
        'Login',
        async () => {

            await page.goto(
                URL_LOGIN
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

            console.log('');
            console.log(
                '✓ Login realizado correctamente'
            );

        }
    );


    // =========================================================
    // INGRESAR A BENEFICIOS DESDE MENÚ LATERAL
    // =========================================================

    await test.step(
        'Ingresar a Beneficios desde menú lateral',
        async () => {

            const beneficios = page
                .getByText(
                    'Beneficios',
                    {
                        exact: true
                    }
                )
                .last();

            await expect(
                beneficios
            ).toBeVisible({
                timeout: 60000
            });

            console.log(
                '✓ Beneficios encontrado en menú lateral'
            );

            await beneficios.click();

            await page.waitForURL(
                '**/socio/clubBeneficios',
                {
                    timeout: 60000
                }
            );

            await esperarCarga(page);

            await expect(
                page.getByText(
                    'Beneficios Destacados',
                    {
                        exact: true
                    }
                )
            ).toBeVisible({
                timeout: 60000
            });

            await expect(
                page.getByText(
                    'Categorías',
                    {
                        exact: true
                    }
                )
            ).toBeVisible({
                timeout: 60000
            });

            console.log(
                '✓ Se ingresó correctamente a Beneficios'
            );

            console.log(
                `✓ URL: ${page.url()}`
            );

        }
    );


    // =========================================================
    // ÓPTICAS
    // =========================================================

    await test.step(
        'Ópticas',
        async () => {

            await ingresarCategoria(
                'Ópticas',
                URL_OPTICAS
            );

            // -------------------------------------------------
            // CARD 1
            // -------------------------------------------------

            await validarCard(
                'Óptica Concentra Beller'
            );

            // Volver a la categoría

            await page.goto(
                URL_OPTICAS,
                {
                    waitUntil: 'domcontentloaded'
                }
            );

            await esperarCarga(page);

            // -------------------------------------------------
            // CARD 2
            // -------------------------------------------------

            await validarCard(
                'Arte y Visión'
            );

            // Volver a Home de Beneficios

            await volverABeneficios();

            console.log(
                '✓ Ópticas finalizado correctamente'
            );

        }
    );


    // =========================================================
    // GYM / DEPORTES
    // =========================================================

    await test.step(
        'Gym / Deportes',
        async () => {

            await ingresarCategoria(
                'Gym / Deportes',
                URL_DEPORTES
            );

            // -------------------------------------------------
            // CARD 1
            // -------------------------------------------------

            await validarCard(
                'Sparring Center'
            );

            // Volver a la categoría

            await page.goto(
                URL_DEPORTES,
                {
                    waitUntil: 'domcontentloaded'
                }
            );

            await esperarCarga(page);

            // -------------------------------------------------
            // CARD 2
            // -------------------------------------------------

            await validarCard(
                'Action Sport Lomas de Zamora'
            );

            // Volver a la categoría

            await page.goto(
                URL_DEPORTES,
                {
                    waitUntil: 'domcontentloaded'
                }
            );

            await esperarCarga(page);

            // -------------------------------------------------
            // CARD 3
            // -------------------------------------------------

            await validarCard(
                'BAYRES CENTER GYM'
            );

            // Volver a la categoría

            await page.goto(
                URL_DEPORTES,
                {
                    waitUntil: 'domcontentloaded'
                }
            );

            await esperarCarga(page);

            // -------------------------------------------------
            // CARD 4
            // -------------------------------------------------

            await validarCard(
                'Red DEPORBAS'
            );

            // Volver a Home de Beneficios

            await volverABeneficios();

            console.log(
                '✓ Gym / Deportes finalizado correctamente'
            );

        }
    );


    // =========================================================
    // ESTÉTICA Y RELAX
    // =========================================================

    await test.step(
        'Estética y Relax',
        async () => {

            await ingresarCategoria(
                'Estética y Relax',
                URL_ESTETICA
            );

            // -------------------------------------------------
            // CARD 1
            // -------------------------------------------------
            // En pantalla aparece:
            // "Trinoma Health & Beaut..."
            //
            // Buscamos solamente "Trinoma"

            await validarCard(
                'Trinoma'
            );

            // Volver a la categoría

            await page.goto(
                URL_ESTETICA,
                {
                    waitUntil: 'domcontentloaded'
                }
            );

            await esperarCarga(page);

            // -------------------------------------------------
            // CARD 2
            // -------------------------------------------------

            await validarCard(
                'Julieta Catini'
            );

            // Volver a la categoría

            await page.goto(
                URL_ESTETICA,
                {
                    waitUntil: 'domcontentloaded'
                }
            );

            await esperarCarga(page);

            // -------------------------------------------------
            // CARD 3
            // -------------------------------------------------

            await validarCard(
                'Centro Médico Urbano'
            );

            // Volver a la categoría

            await page.goto(
                URL_ESTETICA,
                {
                    waitUntil: 'domcontentloaded'
                }
            );

            await esperarCarga(page);

            // -------------------------------------------------
            // CARD 4
            // -------------------------------------------------

            await validarCard(
                'Beba Scally'
            );

            // Volver a la categoría

            await page.goto(
                URL_ESTETICA,
                {
                    waitUntil: 'domcontentloaded'
                }
            );

            await esperarCarga(page);

            // -------------------------------------------------
            // CARD 5
            // -------------------------------------------------

            await validarCard(
                'Verde Manzana SPA'
            );

            // Volver a Home de Beneficios

            await volverABeneficios();

            console.log(
                '✓ Estética y Relax finalizado correctamente'
            );

        }
    );


    // =========================================================
    // COMPRAS
    // =========================================================

    await test.step(
        'Compras',
        async () => {

            await ingresarCategoria(
                'Compras',
                URL_COMPRAS
            );

            // -------------------------------------------------
            // CARD 1
            // -------------------------------------------------

            await validarCard(
                'Perfumería MEBA'
            );

            // Volver a Home de Beneficios

            await volverABeneficios();

            console.log(
                '✓ Compras finalizado correctamente'
            );

        }
    );


    // =========================================================
    // VALIDACIÓN FINAL
    // =========================================================

    await test.step(
        'Validación final',
        async () => {

            await expect(
                page
            ).toHaveURL(
                URL_BENEFICIOS
            );

            await expect(
                page.getByText(
                    'Beneficios Destacados',
                    {
                        exact: true
                    }
                )
            ).toBeVisible({
                timeout: 60000
            });

            console.log('');
            console.log(
                '========================================'
            );

            console.log(
                '✓ TEST DE BENEFICIOS FINALIZADO'
            );

            console.log(
                '========================================'
            );

            console.log(
                '✓ Ópticas: 2 cards'
            );

            console.log(
                '✓ Gym / Deportes: 4 cards'
            );

            console.log(
                '✓ Estética y Relax: 5 cards'
            );

            console.log(
                '✓ Compras: 1 card'
            );

            console.log(
                '✓ TOTAL: 12 CARDS RECORRIDAS'
            );

            console.log(
                '✓ El test terminó en Home de Beneficios'
            );

            console.log(
                '========================================'
            );

        }
    );

});