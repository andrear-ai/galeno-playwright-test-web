import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { users } from '../data/users';
import { esperarCarga } from '../utils/waits';

test.setTimeout(0);


//=========================================================
// Obtener buscador de formularios
//=========================================================

function obtenerBuscador(page: Page) {

    const buscadorLabel = page.getByLabel(
        '¿Qué formulario necesitás?'
    );

    return buscadorLabel.or(
        page.locator('#\\:rs\\:')
    ).first();

}


//=========================================================
// Función para buscar formularios
//=========================================================

async function buscarFormulario(
    page: Page,
    texto: string
) {

    console.log(
        `Escribiendo búsqueda: ${texto}`
    );

    const buscador = obtenerBuscador(page);

    await expect(buscador).toBeVisible({
        timeout: 30000
    });

    await buscador.fill('');

    await buscador.fill(texto);

    await page.waitForTimeout(1000);

    const formularios = page.locator(
        '.css-n1po2-cardFormularios'
    );

    console.log(
        `Cantidad de formularios encontrados: ${await formularios.count()}`
    );

    await expect(
        formularios.first()
    ).toBeVisible();

}


//=========================================================
// Función para descargar formularios
//=========================================================

async function descargarFormularios(
    page: Page
) {

    const cards = page.locator(
        '.css-n1po2-cardFormularios'
    );

    const cantidad = await cards.count();

    console.log(
        `Se encontraron ${cantidad} formularios.`
    );


    for (let i = 0; i < cantidad; i++) {

        console.log(
            `Procesando formulario ${i + 1} de ${cantidad}`
        );

        const card = cards.nth(i);

        const nombre = await card
            .locator('p')
            .textContent();

        console.log(
            `Descargando: ${nombre}`
        );

        await card.scrollIntoViewIfNeeded();

        const paginaPrincipal = page;

        const popupPromise = page
            .waitForEvent('popup')
            .catch(() => null);

        const downloadPromise = page
            .waitForEvent('download', {
                timeout: 5000
            })
            .catch(() => null);

        await card.click();

        const popup = await popupPromise;
        const download = await downloadPromise;


        if (download) {

            console.log(
                `✔ Descargado: ${await download.suggestedFilename()}`
            );


        } else if (popup) {

            console.log(
                '✔ PDF abierto en nueva pestaña'
            );

            await popup.waitForLoadState();

            console.log(
                `PDF URL: ${popup.url()}`
            );

            await popup.close();

            await paginaPrincipal.bringToFront();


        } else {

            console.log(
                '⚠ No se detectó descarga ni popup'
            );

        }

        await paginaPrincipal.waitForTimeout(1000);

    }

}


//=========================================================
// Ingresar a Resultados de Laboratorio
//=========================================================

async function ingresarResultadosLaboratorio(
    page: Page
) {

    console.log(
        'Ingresando a Resultados de Laboratorio...'
    );


    const resultadosLaboratorio = page
        .getByText(
            'Resultados de Laboratorio',
            {
                exact: true
            }
        )
        .first();


    await expect(
        resultadosLaboratorio
    ).toBeVisible({
        timeout: 30000
    });


    await resultadosLaboratorio.click();


    await page.waitForURL(
        '**/socio/resultado_laboratorio',
        {
            timeout: 30000
        }
    );


    console.log(
        'URL Resultados de Laboratorio:',
        page.url()
    );


    //=====================================================
    // Esperar que la página determine si hay o no
    // resultados de laboratorio.
    //
    // No usamos solamente esperarCarga(), porque la
    // tabla puede renderizarse después de que finaliza
    // el loader general.
    //=====================================================

    const descargas = page.locator(
        'svg[data-icon="arrow-to-bottom"]'
    );


    const mensajeSinResultados = page.getByText(
        'Por el momento no hay resultados de laboratorio.',
        {
            exact: true
        }
    );


    await expect.poll(
        async () => {

            const cantidadDescargas =
                await descargas.count();

            const sinResultados =
                await mensajeSinResultados
                    .isVisible()
                    .catch(() => false);


            console.log(
                `Esperando resultados... descargas=${cantidadDescargas}, sinResultados=${sinResultados}`
            );


            return (
                cantidadDescargas > 0 ||
                sinResultados
            );

        },
        {
            timeout: 30000,
            intervals: [500, 1000, 2000]
        }
    ).toBe(true);


    console.log(
        `Resultados detectados: ${await descargas.count()}`
    );

}


//=========================================================
// Descargar un resultado de laboratorio
//=========================================================

async function descargarResultadoLaboratorio(
    page: Page,
    numero: number
) {

    console.log(
        `Descargando Resultado de Laboratorio ${numero}...`
    );


    // Volvemos a obtener el locator en cada iteración.
    // Esto evita problemas si React vuelve a renderizar
    // la tabla después de cerrar el PDF.

    const descarga = page
        .locator(
            'svg[data-icon="arrow-to-bottom"]'
        )
        .nth(numero - 1);


    await expect(
        descarga
    ).toBeVisible({
        timeout: 30000
    });


    await descarga.scrollIntoViewIfNeeded();


    const celda = descarga.locator('..');


    const popupPromise = page
        .waitForEvent('popup', {
            timeout: 10000
        })
        .catch(() => null);


    const downloadPromise = page
        .waitForEvent('download', {
            timeout: 10000
        })
        .catch(() => null);


    await celda.click();


    const popup = await popupPromise;
    const download = await downloadPromise;


    //=====================================================
    // PDF descargado directamente
    //=====================================================

    if (download) {

        console.log(
            `✔ PDF descargado: ${
                await download.suggestedFilename()
            }`
        );

        return;

    }


    //=====================================================
    // PDF abierto en nueva pestaña
    //=====================================================

    if (popup) {

        console.log(
            `✔ PDF abierto en nueva pestaña: ${
                popup.url()
            }`
        );


        await popup.waitForLoadState();


        console.log(
            `URL del PDF: ${popup.url()}`
        );


        await popup.close();


        await page.bringToFront();


        console.log(
            `✔ Pestaña del PDF ${numero} cerrada`
        );


        return;

    }


    //=====================================================
    // No se detectó ninguna de las dos opciones
    //=====================================================

    throw new Error(
        `No se detectó descarga ni nueva pestaña para el PDF ${numero}`
    );

}


//=========================================================
// Descargar todos los resultados de laboratorio
//=========================================================

async function descargarResultadosLaboratorio(
    page: Page
) {

    const descargas = page.locator(
        'svg[data-icon="arrow-to-bottom"]'
    );


    //=====================================================
    // Esperar hasta que exista al menos un resultado.
    //=====================================================

    await expect.poll(
        async () => await descargas.count(),
        {
            timeout: 30000,
            intervals: [500, 1000, 2000]
        }
    ).toBeGreaterThan(0);


    const cantidad =
        await descargas.count();


    console.log(
        `Cantidad de resultados encontrados: ${cantidad}`
    );


    //=====================================================
    // Descargar uno por uno
    //=====================================================

    for (
        let i = 1;
        i <= cantidad;
        i++
    ) {

        console.log(
            '================================================='
        );

        console.log(
            `Procesando PDF ${i} de ${cantidad}`
        );

        console.log(
            '================================================='
        );


        await descargarResultadoLaboratorio(
            page,
            i
        );


        await page.waitForTimeout(1000);

    }


    console.log(
        '✔ Todos los resultados fueron procesados'
    );

}


//=========================================================
// Validar usuario sin resultados
//=========================================================

async function validarSinResultadosLaboratorio(
    page: Page
) {

    console.log(
        'Validando mensaje de ausencia de resultados...'
    );


    const mensajePrincipal = page.getByText(
        'Por el momento no hay resultados de laboratorio.',
        {
            exact: true
        }
    );


    await expect(
        mensajePrincipal
    ).toBeVisible({
        timeout: 30000
    });


    console.log(
        '✔ Mensaje principal encontrado'
    );


    const mensajeSecundario = page.getByText(
        'Acá vas a poder encontrarlos.',
        {
            exact: true
        }
    );


    await expect(
        mensajeSecundario
    ).toBeVisible({
        timeout: 30000
    });


    console.log(
        '✔ Mensaje secundario encontrado'
    );


    console.log(
        '✔ Usuario sin resultados de laboratorio validado correctamente'
    );

}


//=========================================================
// Procesar resultados de laboratorio
//
// CONDICIÓN:
//
// Si hay PDFs:
//      → Descargar todos.
//
// Si NO hay PDFs:
//      → Validar los dos mensajes.
//
// Esto permite que la prueba continúe correctamente
// aunque en algún momento se eliminen los resultados.
//=========================================================

async function procesarResultadosLaboratorio(
    page: Page,
    usuario: string
) {

    console.log(
        '================================================='
    );

    console.log(
        `Procesando laboratorio: ${usuario}`
    );

    console.log(
        '================================================='
    );


    const descargas = page.locator(
        'svg[data-icon="arrow-to-bottom"]'
    );


    const mensajePrincipal = page.getByText(
        'Por el momento no hay resultados de laboratorio.',
        {
            exact: true
        }
    );


    //=====================================================
    // Esperar hasta que aparezcan:
    //
    // - PDFs
    //
    // O
    //
    // - mensaje sin resultados
    //=====================================================

    await expect.poll(
        async () => {

            const cantidadDescargas =
                await descargas.count();

            const sinResultados =
                await mensajePrincipal
                    .isVisible()
                    .catch(() => false);


            return (
                cantidadDescargas > 0 ||
                sinResultados
            );

        },
        {
            timeout: 30000,
            intervals: [500, 1000, 2000]
        }
    ).toBe(true);


    const cantidad =
        await descargas.count();


    //=====================================================
    // CASO 1: HAY RESULTADOS
    //=====================================================

    if (cantidad > 0) {

        console.log(
            `✔ ${usuario}: se encontraron ${cantidad} PDF(s).`
        );


        await descargarResultadosLaboratorio(
            page
        );


        console.log(
            `✔ ${usuario}: PDFs procesados correctamente.`
        );


        return;

    }


    //=====================================================
    // CASO 2: NO HAY RESULTADOS
    //=====================================================

    console.log(
        `⚠ ${usuario}: no se encontraron resultados de laboratorio.`
    );


    await validarSinResultadosLaboratorio(
        page
    );


    console.log(
        `✔ ${usuario}: mensaje de ausencia validado.`
    );

}


//=========================================================
// Abrir Grupo familiar
//=========================================================

async function abrirGrupoFamiliar(
    page: Page
) {

    console.log(
        'Abriendo Grupo familiar...'
    );


    const grupoFamiliar = page
        .getByText(
            'Grupo familiar',
            {
                exact: true
            }
        )
        .first();


    await expect(
        grupoFamiliar
    ).toBeVisible({
        timeout: 30000
    });


    await grupoFamiliar.click();


    await page.waitForTimeout(1000);


    console.log(
        '✔ Grupo familiar abierto'
    );

}


//=========================================================
// Seleccionar integrante
//=========================================================

async function seleccionarIntegrante(
    page: Page
) {

    console.log(
        'Buscando integrante del grupo familiar...'
    );


    const integrante = page
        .locator(
            'span.MuiCardHeader-title'
        )
        .filter({
            hasText: /Ilay|Ilya/i
        })
        .first();


    await expect(
        integrante
    ).toBeVisible({
        timeout: 30000
    });


    console.log(
        'Integrante encontrado:',
        await integrante.textContent()
    );


    await integrante.click();


    await page.waitForTimeout(1000);


    console.log(
        '✔ Integrante seleccionado'
    );

}


//=========================================================
// Cerrar sesión
//=========================================================

async function cerrarSesion(
    page: Page
) {

    console.log(
        'Cerrando sesión...'
    );


    const cerrarSesion = page
        .getByText(
            'Cerrar Sesión',
            {
                exact: true
            }
        )
        .first();


    await expect(
        cerrarSesion
    ).toBeVisible({
        timeout: 30000
    });


    await cerrarSesion.click();


    // Esperar regreso al login.

    await page.waitForURL(
        '**/login/**',
        {
            timeout: 30000
        }
    ).catch(async () => {

        await page.waitForTimeout(2000);

    });


    console.log(
        'Sesión cerrada. URL:',
        page.url()
    );

}


//=========================================================
// Obtener usuario por tipo
//=========================================================

function obtenerUsuarioPorTipo(
    tipo: string
) {

    const usuario = users.find(
        u => u.tipo === tipo
    );


    if (!usuario) {

        throw new Error(
            `Usuario con tipo "${tipo}" no encontrado`
        );

    }


    return usuario;

}


//=========================================================
// TEST
//=========================================================

test(
    'Resultados de Laboratorio - azul, titular, grupo familiar y oro',
    async ({ page }) => {


        const loginPage = new LoginPage(page);


        //=================================================
        // 1. USUARIO CARTILLA AZUL
        //=================================================

        const usuarioAzul =
            obtenerUsuarioPorTipo('azul');


        await test.step(
            'Login usuario Cartilla Azul',
            async () => {

                await page.goto(
                    'https://portal-test.galeno.com.ar/login/'
                );


                await loginPage.login(
                    usuarioAzul.dni,
                    usuarioAzul.password
                );


                await page.waitForURL(
                    '**/socio/home'
                );


                console.log(
                    '✔ Login Cartilla Azul realizado correctamente'
                );

            }
        );


        //=================================================
        // RESULTADOS AZUL
        //=================================================

        await test.step(
            'Procesar resultados Cartilla Azul',
            async () => {

                await ingresarResultadosLaboratorio(
                    page
                );


                await procesarResultadosLaboratorio(
                    page,
                    'Cartilla Azul'
                );

            }
        );


        //=================================================
        // CERRAR SESIÓN AZUL
        //=================================================

        await test.step(
            'Cerrar sesión Cartilla Azul',
            async () => {

                await cerrarSesion(
                    page
                );

            }
        );


        //=================================================
        // 2. USUARIO 95786178
        //=================================================

        await test.step(
            'Login usuario 95786178',
            async () => {

                await page.goto(
                    'https://portal-test.galeno.com.ar/login/'
                );


                await loginPage.login(
                    '95786178',
                    usuarioAzul.password
                );


                await page.waitForURL(
                    '**/socio/home'
                );


                console.log(
                    '✔ Login 95786178 realizado correctamente'
                );

            }
        );


        //=================================================
        // RESULTADOS TITULAR
        //=================================================

        await test.step(
            'Procesar resultados titular 95786178',
            async () => {

                await ingresarResultadosLaboratorio(
                    page
                );


                await procesarResultadosLaboratorio(
                    page,
                    'Usuario 95786178 - Titular'
                );

            }
        );


        //=================================================
        // GRUPO FAMILIAR
        //=================================================

        await test.step(
            'Seleccionar integrante del grupo familiar',
            async () => {

                await abrirGrupoFamiliar(
                    page
                );


                await seleccionarIntegrante(
                    page
                );

            }
        );


        //=================================================
        // RESULTADOS INTEGRANTE
        //=================================================

        await test.step(
            'Procesar resultados integrante',
            async () => {

                await esperarCarga(
                    page
                );


                await procesarResultadosLaboratorio(
                    page,
                    'Usuario 95786178 - Integrante'
                );

            }
        );


        //=================================================
        // CERRAR SESIÓN 95786178
        //=================================================

        await test.step(
            'Cerrar sesión usuario 95786178',
            async () => {

                await cerrarSesion(
                    page
                );

            }
        );


        //=================================================
        // 3. USUARIO CARTILLA ORO
        //=================================================

        const usuarioOro =
            obtenerUsuarioPorTipo('oro');


        await test.step(
            'Login usuario Cartilla Oro',
            async () => {

                await page.goto(
                    'https://portal-test.galeno.com.ar/login/'
                );


                await loginPage.login(
                    usuarioOro.dni,
                    usuarioOro.password
                );


                await page.waitForURL(
                    '**/socio/home'
                );


                console.log(
                    '✔ Login Cartilla Oro realizado correctamente'
                );

            }
        );


        //=================================================
        // RESULTADOS ORO
        //
        // Si no hay PDFs:
        //      valida mensaje.
        //
        // Si aparecen PDFs en el futuro:
        //      los descarga.
        //=================================================

        await test.step(
            'Procesar resultados Cartilla Oro',
            async () => {

                await ingresarResultadosLaboratorio(
                    page
                );


                await procesarResultadosLaboratorio(
                    page,
                    'Cartilla Oro'
                );

            }
        );


        //=================================================
        // FIN
        //=================================================

        console.log(
            '================================================='
        );

        console.log(
            '✔ FLUJO COMPLETO FINALIZADO CORRECTAMENTE'
        );

        console.log(
            '✔ Cartilla Azul: resultados procesados'
        );

        console.log(
            '✔ Usuario 95786178: resultados del titular procesados'
        );

        console.log(
            '✔ Usuario 95786178: resultados del integrante procesados'
        );

        console.log(
            '✔ Cartilla Oro: resultados procesados'
        );

        console.log(
            '================================================='
        );

    }
);


