import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { users } from '../data/users';
import { esperarCarga } from '../utils/waits';

test.setTimeout(180000);

test('Preguntas Frecuentes - recorrer todas las preguntas', async ({ page }) => {

    const user = users.find(u => u.tipo === 'azul');

    if (!user) {
        throw new Error('Usuario azul no encontrado');
    }

    const loginPage = new LoginPage(page);

    const URL_PREGUNTAS =
        'https://portal-test.galeno.com.ar/socio/preguntas';


  

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
    // INGRESAR A PREGUNTAS FRECUENTES
    // =========================================================

    await test.step('Ingresar a Preguntas Frecuentes', async () => {

        const preguntasFrecuentes =
            page.getByRole(
                'button',
                {
                    name: 'Preguntas Frecuentes'
                }
            );


        await expect(
            preguntasFrecuentes
        ).toBeVisible({
            timeout: 60000
        });


        await preguntasFrecuentes.click();


        await esperarCarga(page);


        await expect(
            page.locator('#toTopPage')
        ).toBeVisible({
            timeout: 60000
        });


        // Esperamos una categoría real de la página.
        await expect(
            page.locator('#toTopPage')
                .getByText(
                    'Credencial Virtual y Token de seguridad',
                    {
                        exact: true
                    }
                )
                .last()
        ).toBeVisible({
            timeout: 60000
        });

    });


    // =========================================================
    // OBTENER CATEGORÍAS
    // =========================================================

    const categorias = [
        'Credencial Virtual y Token de seguridad',
        'Acceso a nuestros Servicios',
        'Planes',
        'Internaciones',
        'Autorizaciones',
        'Reintegros',
        'Validez de las Órdenes Médicas',
        'Modalidad de Pago',
        'Cartilla',
        'Cobertura Nacional',
        'Cobertura Internacional'
    ];


    console.log(
        '========================================'
    );

    console.log(
        `Categorías a recorrer: ${categorias.length}`
    );

    console.log(
        '========================================'
    );


    // =========================================================
    //  VOLVER A PREGUNTAS FRECUENTES
    // =========================================================

    async function volverAPreguntasFrecuentes() {

        console.log(
            'Volviendo a Preguntas Frecuentes...'
        );


        await page.goto(
            URL_PREGUNTAS,
            {
                waitUntil: 'domcontentloaded'
            }
        );


        await esperarCarga(page);


        // Esperamos que el contenedor principal exista.
        await expect(
            page.locator('#toTopPage')
        ).toBeVisible({
            timeout: 60000
        });


        // Esperamos hasta que las categorías estén realmente
        // cargadas.
        await expect.poll(
            async () => {

                const texto =
                    await page
                        .locator('#toTopPage')
                        .innerText();

                return texto.length;

            },
            {
                timeout: 60000
            }
        ).toBeGreaterThan(100);


        console.log(
            '✓ Preguntas Frecuentes cargada nuevamente'
        );

    }


    // =========================================================
    // RECORRER CATEGORÍAS
    // =========================================================

    for (
        let categoriaIndex = 0;
        categoriaIndex < categorias.length;
        categoriaIndex++
    ) {

        const nombreCategoria =
            categorias[categoriaIndex];


        await test.step(
            `Categoría ${categoriaIndex + 1}: ${nombreCategoria}`,
            async () => {


                console.log(
                    '========================================'
                );

                console.log(
                    `INICIANDO: ${nombreCategoria}`
                );

                console.log(
                    '========================================'
                );


                // =====================================================
                // ASEGURAR PÁGINA PRINCIPAL
                // =====================================================

                if (
                    !page.url().includes('/socio/preguntas')
                ) {

                    await volverAPreguntasFrecuentes();

                }


                const contenido =
                    page.locator('#toTopPage');


                await expect(
                    contenido
                ).toBeVisible({
                    timeout: 60000
                });


                // =====================================================
                // BUSCAR CATEGORÍA
                // =====================================================

                const categoria =
                    contenido
                        .getByText(
                            nombreCategoria,
                            {
                                exact: true
                            }
                        )
                        .last();


                // =====================================================
                // SI NO ENCUENTRA LA CATEGORÍA
                // =====================================================

                if (
                    await categoria.count() === 0
                ) {

                    console.log(
                        '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
                    );

                    console.log(
                        `NO SE ENCONTRÓ: ${nombreCategoria}`
                    );

                    console.log(
                        'Contenido actual de la página:'
                    );

                    console.log(
                        await contenido.innerText()
                    );

                    console.log(
                        '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
                    );


                    throw new Error(
                        `No se encontró la categoría "${nombreCategoria}"`
                    );

                }


                await expect(
                    categoria
                ).toBeVisible({
                    timeout: 60000
                });


                console.log(
                    `✓ Categoría encontrada`
                );


                // =====================================================
                // CLICK EN CATEGORÍA
                // =====================================================

                await categoria.click();


                await esperarCarga(page);


                console.log(
                    `✓ Categoría abierta`
                );


                // =====================================================
                // ESPERAR CONTENIDO
                // =====================================================

                await expect(
                    page.locator('#toTopPage')
                ).toBeVisible({
                    timeout: 60000
                });


              

                let acordeones =
                    page.locator(
                        '#toTopPage [class*="MuiAccordion"]'
                    );


                let cantidadAcordeones =
                    await acordeones.count();


                console.log(
                    `Acordeones encontrados: ${cantidadAcordeones}`
                );


               

                if (
                    cantidadAcordeones === 0
                ) {

                    acordeones =
                        page.locator(
                            '#toTopPage [aria-expanded]'
                        );


                    cantidadAcordeones =
                        await acordeones.count();


                    console.log(
                        `Elementos aria-expanded encontrados: ${cantidadAcordeones}`
                    );

                }


                // =====================================================
                // VALIDAR PREGUNTAS
                // =====================================================

                if (
                    cantidadAcordeones === 0
                ) {

                    console.log(
                        'Contenido de la categoría:'
                    );

                    console.log(
                        await page
                            .locator('#toTopPage')
                            .innerText()
                    );


                    throw new Error(
                        `No se encontraron preguntas para "${nombreCategoria}"`
                    );

                }


                // =====================================================
                // GUARDAR PREGUNTAS
                // =====================================================

                const preguntas: string[] = [];


                for (
                    let i = 0;
                    i < cantidadAcordeones;
                    i++
                ) {

                    const acordeon =
                        acordeones.nth(i);


                    if (
                        !(await acordeon.isVisible())
                    ) {
                        continue;
                    }


                    let texto = '';

                    try {

                        texto =
                            (
                                await acordeon.innerText()
                            ).trim();

                    } catch {

                        continue;

                    }


                    if (
                        texto &&
                        !preguntas.includes(texto)
                    ) {

                        preguntas.push(
                            texto
                        );

                    }

                }


                console.log(
                    `Preguntas únicas encontradas: ${preguntas.length}`
                );


                // =====================================================
                // RECORRER PREGUNTAS UNA SOLA VEZ
                // =====================================================

                for (
                    let preguntaIndex = 0;
                    preguntaIndex < preguntas.length;
                    preguntaIndex++
                ) {

                    const textoPregunta =
                        preguntas[preguntaIndex];


                    console.log(
                        `----------------------------------------`
                    );

                    console.log(
                        `Pregunta ${preguntaIndex + 1}/${preguntas.length}`
                    );

                    console.log(
                        textoPregunta
                    );


                    // =================================================
                    // BUSCAR PREGUNTA ACTUAL
                    // =================================================

                    const pregunta =
                        page.locator('#toTopPage')
                            .getByText(
                                textoPregunta,
                                {
                                    exact: true
                                }
                            )
                            .last();


                    if (
                        await pregunta.count() === 0
                    ) {

                        console.log(
                            `No se encontró nuevamente la pregunta: ${textoPregunta}`
                        );

                        continue;

                    }


                    await expect(
                        pregunta
                    ).toBeVisible({
                        timeout: 60000
                    });


                    // =================================================
                    // CLICK UNA SOLA VEZ
                    // =================================================

                    await pregunta.click();


                    await page.waitForTimeout(
                        700
                    );


                    console.log(
                        '✓ Pregunta desplegada'
                    );


                    // =================================================
                    // VERIFICAR SI ABRIÓ OTRA PÁGINA
                    // =================================================

                    const urlActual =
                        page.url();


                    if (
                        !urlActual.includes('/socio/preguntas')
                    ) {

                        console.log(
                            `La pregunta abrió otra página: ${urlActual}`
                        );


                        await esperarCarga(page);


                        await expect(
                            page.locator('#toTopPage')
                        ).toBeVisible({
                            timeout: 60000
                        });


                        console.log(
                            '✓ Página secundaria cargada'
                        );


                        // Volvemos a Preguntas Frecuentes.
                        await volverAPreguntasFrecuentes();


                        // Volvemos a abrir la categoría.
                        const categoriaVolver =
                            page.locator('#toTopPage')
                                .getByText(
                                    nombreCategoria,
                                    {
                                        exact: true
                                    }
                                )
                                .last();


                        await expect(
                            categoriaVolver
                        ).toBeVisible({
                            timeout: 60000
                        });


                        await categoriaVolver.click();


                        await esperarCarga(page);


                        console.log(
                            `✓ Volvió a la categoría ${nombreCategoria}`
                        );

                    }

                }


                // =====================================================
                // CATEGORÍA TERMINADA
                // =====================================================

                console.log(
                    '========================================'
                );

                console.log(
                    `✓ TERMINÓ: ${nombreCategoria}`
                );

                console.log(
                    '========================================'
                );


                // =====================================================
                // VOLVER A PREGUNTAS FRECUENTES
                // =====================================================

                await volverAPreguntasFrecuentes();


                console.log(
                    '✓ Lista principal nuevamente disponible'
                );

            }
        );

    }


    // =========================================================
    // FINAL
    // =========================================================

    console.log(
        '========================================'
    );

    console.log(
        '✓ TODAS LAS CATEGORÍAS FUERON RECORRIDAS'
    );

    console.log(
        '✓ TODAS LAS PREGUNTAS FUERON DESPLEGADAS'
    );

    console.log(
        '✓ TEST FINALIZADO'
    );

    console.log(
        '========================================'
    );

});