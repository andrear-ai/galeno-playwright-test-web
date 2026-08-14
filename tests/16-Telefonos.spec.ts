import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { users } from '../data/users';
import { esperarCarga } from '../utils/waits';

test.setTimeout(450000);

test('Teléfonos - flujo completo', async ({ page }) => {

    // =====================================================
    // LOGIN
    // NO TOCAR
    // =====================================================

    const usuario = users.find(
        user => user.tipo === 'azul'
    );

    if (!usuario) {
        throw new Error('No se encontró el usuario azul');
    }

    const loginPage = new LoginPage(page);

    await loginPage.goto();

    await loginPage.login(
        usuario.dni,
        usuario.password
    );

    await esperarCarga(page);

    console.log('Login realizado correctamente');


    // =====================================================
    // FUNCIÓN PARA OBTENER CARD
    // =====================================================

    function obtenerCard(
        page: Page,
        nombreCard: string
    ) {
        return page
            .getByText(nombreCard, { exact: true })
            .first()
            .locator('..')
            .locator('..');
    }


    // =====================================================
    // RECORRIDO COMPLETO DE TELÉFONOS
    // =====================================================

    async function recorrerTelefonos(
        origen: string
    ) {

        console.log(
            '============================================'
        );

        console.log(
            `INICIO FLUJO TELÉFONOS - ${origen}`
        );

        console.log(
            '============================================'
        );


        // =================================================
        // VALIDAR PÁGINA
        // =================================================

        await expect(
            page.getByText(
                'Riesgo de vida',
                { exact: true }
            )
        ).toBeVisible({
            timeout: 60000
        });

        console.log(
            `Página de Teléfonos cargada correctamente desde ${origen}`
        );


        // =================================================
        // CENTRAL DE EMERGENCIAS
        // =================================================

        const centralEmergencias =
            obtenerCard(
                page,
                'Central de Emergencias'
            );

        await expect(
            centralEmergencias
        ).toBeVisible({
            timeout: 60000
        });

        console.log(
            'Card "Central de Emergencias" visible'
        );


        const botonEmergencias =
            centralEmergencias.getByRole(
                'button',
                {
                    name: 'show more'
                }
            );

        await expect(
            botonEmergencias
        ).toBeVisible({
            timeout: 60000
        });


        // ABRIR

        await botonEmergencias.click();

        await expect(
            centralEmergencias.getByText(
                'Menos información',
                { exact: true }
            )
        ).toBeVisible({
            timeout: 60000
        });

        console.log(
            'Información de "Central de Emergencias" desplegada correctamente'
        );


        // CERRAR

        await botonEmergencias.click();

        await expect(
            centralEmergencias.getByText(
                'Más información',
                { exact: true }
            )
        ).toBeVisible({
            timeout: 60000
        });

        console.log(
            'Información de "Central de Emergencias" cerrada correctamente'
        );


        // =================================================
        // SERVICIO DE ATENCIÓN AL CLIENTE
        // =================================================

        const servicioCliente =
            obtenerCard(
                page,
                'Servicio de Atención al Cliente'
            );

        await expect(
            servicioCliente
        ).toBeVisible({
            timeout: 60000
        });

        console.log(
            'Card "Servicio de Atención al Cliente" visible'
        );


        // =================================================
        // WHATSAPP
        // =================================================

        const numeroWhatsApp =
            page.getByText(
                '11-6163-0000',
                {
                    exact: true
                }
            );

        await expect(
            numeroWhatsApp
        ).toBeVisible({
            timeout: 60000
        });

        console.log(
            'Número de WhatsApp visible correctamente'
        );


        const iconoWhatsApp =
            page.locator(
                'main img[alt="iconWsp"]'
            ).first();

        await expect(
            iconoWhatsApp
        ).toBeVisible({
            timeout: 60000
        });

        console.log(
            'Icono de WhatsApp visible correctamente'
        );


        // =================================================
        // ABRIR WHATSAPP EN NUEVA PESTAÑA
        // =================================================

        const [whatsappPage] =
            await Promise.all([
                page.context().waitForEvent('page'),
                numeroWhatsApp.click()
            ]);

        console.log(
            'Nueva pestaña de WhatsApp abierta'
        );


        // Esperar a que la pestaña tenga una URL

        await whatsappPage.waitForLoadState(
            'domcontentloaded'
        );


        const whatsappUrl =
            whatsappPage.url();

        console.log(
            `URL de WhatsApp: ${whatsappUrl}`
        );


        // =================================================
        // CERRAR INMEDIATAMENTE WHATSAPP
        // =================================================

        await whatsappPage.close();

        console.log(
            'Pestaña de WhatsApp cerrada correctamente'
        );


        // =================================================
        // VERIFICAR PÁGINA PRINCIPAL
        // =================================================

        await expect(
            servicioCliente
        ).toBeVisible({
            timeout: 60000
        });

        console.log(
            'Página principal disponible nuevamente'
        );


        // =================================================
        // INFORMACIÓN SERVICIO CLIENTE
        // =================================================

        const botonServicio =
            servicioCliente.getByRole(
                'button',
                {
                    name: 'show more'
                }
            );

        await expect(
            botonServicio
        ).toBeVisible({
            timeout: 60000
        });


        // ABRIR

        await botonServicio.click();

        await expect(
            servicioCliente.getByText(
                'Menos información',
                { exact: true }
            )
        ).toBeVisible({
            timeout: 60000
        });

        console.log(
            'Información de Servicio de Atención al Cliente desplegada'
        );


        // =================================================
        // VALIDAR ICONO WHATSAPP
        // =================================================

        // IMPORTANTE:
        // El icono está dentro de MAIN, pero no dentro
        // del contenedor exacto obtenido por obtenerCard().
        // Por eso no usamos servicioCliente.locator(...)
        
        const iconoWhatsAppServicio =
            page.locator(
                'main img[alt="iconWsp"]'
            ).first();

        await expect(
            iconoWhatsAppServicio
        ).toBeVisible({
            timeout: 60000
        });

        console.log(
            'Icono de WhatsApp visible correctamente'
        );


        // =================================================
        // CERRAR
        // =================================================

        await botonServicio.click();

        await expect(
            servicioCliente.getByText(
                'Más información',
                { exact: true }
            )
        ).toBeVisible({
            timeout: 60000
        });

        console.log(
            'Información de Servicio de Atención al Cliente cerrada'
        );


        // =================================================
        // ABRIR NUEVAMENTE
        // =================================================

        await botonServicio.click();

        await expect(
            servicioCliente.getByText(
                'Menos información',
                { exact: true }
            )
        ).toBeVisible({
            timeout: 60000
        });

        console.log(
            'Información de Servicio de Atención al Cliente abierta nuevamente'
        );


        // =================================================
        // CERRAR FINALMENTE
        // =================================================

        await botonServicio.click();

        await expect(
            servicioCliente.getByText(
                'Más información',
                { exact: true }
            )
        ).toBeVisible({
            timeout: 60000
        });

        console.log(
            'Servicio de Atención al Cliente finalizado correctamente'
        );


        // =================================================
        // CENTRAL DE AUTORIZACIONES
        // =================================================

        const centralAutorizaciones =
            obtenerCard(
                page,
                'Central de Autorizaciones'
            );

        await expect(
            centralAutorizaciones
        ).toBeVisible({
            timeout: 60000
        });

        console.log(
            'Card "Central de Autorizaciones" visible'
        );


        const botonAutorizaciones =
            centralAutorizaciones.getByRole(
                'button',
                {
                    name: 'show more'
                }
            );

        await expect(
            botonAutorizaciones
        ).toBeVisible({
            timeout: 60000
        });


        // ABRIR

        await botonAutorizaciones.click();

        await expect(
            centralAutorizaciones.getByText(
                'Menos información',
                { exact: true }
            )
        ).toBeVisible({
            timeout: 60000
        });

        console.log(
            'Información de "Central de Autorizaciones" desplegada correctamente'
        );


        // CERRAR

        await botonAutorizaciones.click();

        await expect(
            centralAutorizaciones.getByText(
                'Más información',
                { exact: true }
            )
        ).toBeVisible({
            timeout: 60000
        });

        console.log(
            'Información de "Central de Autorizaciones" cerrada correctamente'
        );


        // =================================================
        // CENTRAL DE TURNOS
        // =================================================

        const centralTurnos =
            page.getByText(
                'Central de Turnos',
                {
                    exact: true
                }
            );

        await expect(
            centralTurnos
        ).toBeVisible({
            timeout: 60000
        });

        console.log(
            'Card "Central de Turnos" visible'
        );


        const numeroCentralTurnos =
            page.getByText(
                '0810-777-2583',
                {
                    exact: true
                }
            );

        await expect(
            numeroCentralTurnos
        ).toBeVisible({
            timeout: 60000
        });

        console.log(
            'Número de Central de Turnos visible correctamente'
        );


        // =================================================
        // SANATORIOS
        // =================================================

        const tituloSanatorios =
            page.locator('main')
                .getByText(
                    'Sanatorios',
                    {
                        exact: true
                    }
                );

        await expect(
            tituloSanatorios
        ).toBeVisible({
            timeout: 60000
        });

        console.log(
            'Título "Sanatorios" visible'
        );


        // =================================================
        // ASISTENCIA NACIONAL AL VIAJERO
        // =================================================

        const tituloAsistencia =
            page.locator('main')
                .getByText(
                    'Asistencia Nacional al Viajero',
                    {
                        exact: true
                    }
                );

        await expect(
            tituloAsistencia
        ).toBeVisible({
            timeout: 60000
        });

        console.log(
            'Título "Asistencia Nacional al Viajero" visible'
        );


        // =================================================
        // ASSIST CARD
        // =================================================

        const tituloAssistCard =
            page.locator('main')
                .getByText(
                    'Assist Card',
                    {
                        exact: true
                    }
                );

        await expect(
            tituloAssistCard
        ).toBeVisible({
            timeout: 60000
        });

        console.log(
            'Título "Assist Card" visible'
        );


        // =================================================
        // FIN DEL RECORRIDO
        // =================================================

        console.log(
            '============================================'
        );

        console.log(
            `FLUJO TELÉFONOS FINALIZADO - ${origen}`
        );

        console.log(
            '============================================'
        );
    }


    // =====================================================
    // FLUJO 1
    // TELÉFONOS DESDE HEADER
    // =====================================================

    const telefonoHeader =
        page.getByRole(
            'button',
            {
                name: 'Teléfonos',
                exact: true
            }
        ).first();

    await expect(
        telefonoHeader
    ).toBeVisible({
        timeout: 60000
    });

    await telefonoHeader.click();

    await esperarCarga(page);

    console.log(
        'Acceso a Teléfonos realizado desde HEADER'
    );

    await recorrerTelefonos(
        'HEADER'
    );


    // =====================================================
    // FLUJO 2
    // TELÉFONOS DESDE MENÚ LATERAL
    // =====================================================

    console.log(
        'Buscando Teléfonos en menú lateral...'
    );

    const telefonoMenuLateral =
        page.locator('nav')
            .getByText(
                'Teléfonos',
                {
                    exact: true
                }
            );

    await telefonoMenuLateral.scrollIntoViewIfNeeded();

    await expect(
        telefonoMenuLateral
    ).toBeVisible({
        timeout: 60000
    });

    console.log(
        'Teléfonos del menú lateral visible'
    );


    // =====================================================
    // CLICK TELÉFONOS MENÚ LATERAL
    // =====================================================

    await telefonoMenuLateral.click();

    await esperarCarga(page);

    console.log(
        'Acceso a Teléfonos realizado desde MENÚ LATERAL'
    );


    // =====================================================
    // REPETIR TODO EL RECORRIDO
    // =====================================================

    await recorrerTelefonos(
        'MENÚ LATERAL'
    );


    // =====================================================
    // FIN TEST
    // =====================================================

    console.log(
        '============================================'
    );

    console.log(
        'TELÉFONOS - AMBOS FLUJOS FINALIZADOS CORRECTAMENTE'
    );

    console.log(
        'HEADER + MENÚ LATERAL'
    );

    console.log(
        '============================================'
    );

});