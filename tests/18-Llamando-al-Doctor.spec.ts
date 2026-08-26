import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { users } from '../data/users';
import { esperarCarga } from '../utils/waits';

test.setTimeout(0);

//=========================================================
// CONSTANTES
//=========================================================

const DNI_AZUL = '36982434';
const DNI_SEGUNDO_USUARIO = '95786178';

const INTEGRANTE_MARTIN = 'Martin';
const INTEGRANTE_YUBESMI = 'Yubesmi';
const INTEGRANTE_ILAY = 'Ilay';

const URL_LOGIN =
    'https://portal-test.galeno.com.ar/login/';

const URL_LLAMANDO_DOCTOR =
    /\/socio\/llamando_doctor/;


//=========================================================
// Obtener usuario azul
//=========================================================

function obtenerUsuarioAzul() {

    const usuario = users.find(
        u => u.dni === DNI_AZUL
    );

    if (!usuario) {
        throw new Error(
            `No se encontró el usuario azul ${DNI_AZUL} en users`
        );
    }

    return usuario;
}


//=========================================================
// Obtener segundo usuario
//=========================================================

function obtenerSegundoUsuario() {

    return users.find(
        u => u.dni === DNI_SEGUNDO_USUARIO
    );
}


//=========================================================
// Iniciar sesión
//=========================================================

async function iniciarSesion(
    page: Page,
    dni: string,
    password: string
) {

    console.log(
        '================================================='
    );

    console.log(
        `Iniciando sesión - DNI: ${dni}`
    );

    console.log(
        '================================================='
    );

    const loginPage =
        new LoginPage(page);

    await page.goto(URL_LOGIN);

    await loginPage.login(
        dni,
        password
    );

    await page.waitForURL(
        '**/socio/home',
        {
            timeout: 30000
        }
    );

    console.log(
        `✔ Login realizado correctamente: ${dni}`
    );
}



async function prepararMenuLateral(
    page: Page
) {

    console.log(
        '================================================='
    );

    console.log(
        'Buscando Llamando al Doctor en el menú...'
    );

    console.log(
        '================================================='
    );

    const llamandoDoctor =
        page
            .getByText(
                'Llamando al Doctor',
                {
                    exact: true
                }
            )
            .first();

    await expect(
        llamandoDoctor
    ).toBeVisible({
        timeout: 30000
    });

    console.log(
        '✔ Llamando al Doctor encontrado en el menú'
    );

    
    await llamandoDoctor.scrollIntoViewIfNeeded();

    console.log(
        '✔ Llamando al Doctor desplazado a la vista'
    );

    await expect(
        llamandoDoctor
    ).toBeInViewport();

    return llamandoDoctor;
}


//=========================================================
// Ingresar a Llamando al Doctor
//=========================================================

async function ingresarLlamandoAlDoctor(
    page: Page
) {

    console.log(
        '================================================='
    );

    console.log(
        'Ingresando a Llamando al Doctor...'
    );

    console.log(
        '================================================='
    );

    const llamandoDoctor =
        await prepararMenuLateral(page);


    

    const popupPromise =
        page.waitForEvent(
            'popup',
            {
                timeout: 10000
            }
        ).catch(
            () => null
        );


    await llamandoDoctor.click();


    const popup =
        await popupPromise;


    //=====================================================
    // CASO 1
    //
    // Llamando al Doctor una nueva pestaña.
    //=====================================================

    if (popup) {

        console.log(
            '✔ Llamando al Doctor se abrió en nueva pestaña'
        );

        await popup.waitForLoadState(
            'domcontentloaded'
        ).catch(
            () => {}
        );

        console.log(
            'URL nueva pestaña:',
            popup.url()
        );

        await popup.close();

        await page.bringToFront();

        console.log(
            '✔ Nueva pestaña de Llamando al Doctor cerrada'
        );

    

        return;
    }


    //=====================================================
    // CASO 2
    //
    // Se abrir directamente en la página principal.
    //=====================================================

    await expect(
        page
    ).toHaveURL(
        URL_LLAMANDO_DOCTOR,
        {
            timeout: 30000
        }
    );

    console.log(
        '✔ Llamando al Doctor se abrió en la pestaña principal'
    );

    console.log(
        'URL actual:',
        page.url()
    );

    await esperarCarga(
        page
    ).catch(
        () => {}
    );
}


//=========================================================
// Validar pantalla de selección de integrante
//=========================================================

async function validarPantallaSeleccionIntegrante(
    page: Page
) {

    console.log(
        'Validando selección de integrante...'
    );

    const texto =
        'Seleccioná el integrante por el cual querés hacer la consulta';

    const mensaje =
        page.getByText(
            texto,
            {
                exact: true
            }
        );

    await expect(
        mensaje
    ).toBeVisible({
        timeout: 30000
    });

    console.log(
        `✔ Texto "${texto}" encontrado`
    );
}


//=========================================================
//  card del integrante
//=========================================================

function obtenerCardIntegrante(
    page: Page,
    nombre: string
) {

    const nombreLocator =
        page
            .locator('p.css-yq975g-nombre')
            .filter({
                hasText: nombre
            })
            .first();

    //=====================================================
    // El nombre está dentro del card.
    //=====================================================

    return nombreLocator.locator('..');
}


//=========================================================
// Validar integrante
//=========================================================

async function validarIntegrante(
    page: Page,
    nombre: string
) {

    console.log(
        `Buscando integrante "${nombre}"...`
    );

    const integrante =
        page
            .locator('p.css-yq975g-nombre')
            .filter({
                hasText: nombre
            })
            .first();

    await expect(
        integrante
    ).toBeVisible({
        timeout: 30000
    });

    console.log(
        `✔ Integrante "${nombre}" encontrado`
    );

    console.log(
        'Elemento encontrado:',
        await integrante.evaluate(
            el => el.outerHTML
        )
    );

    return integrante;
}

//=========================================================

async function seleccionarIntegrante(
    page: Page,
    nombre: string
) {

    console.log(
        '================================================='
    );

    console.log(
        `Seleccionando integrante: ${nombre}`
    );

    console.log(
        '================================================='
    );


    const card =
        obtenerCardIntegrante(
            page,
            nombre
        );


    await expect(
        card
    ).toBeVisible({
        timeout: 30000
    });


    console.log(
        `✔ Card de ${nombre} encontrada`
    );


    //=====================================================
    // El card puede estar abajo.
    // Lo llevamos a viewport.
    //=====================================================

    await card.scrollIntoViewIfNeeded();


    await expect(
        card
    ).toBeInViewport();



    const popupPromise =
        page.waitForEvent(
            'popup',
            {
                timeout: 15000
            }
        ).catch(
            () => null
        );


    await card.click();


    const popup =
        await popupPromise;


    //=====================================================
    // CASO POPUP
    //=====================================================

    if (popup) {

        console.log(
            `✔ Seleccionar ${nombre} abrió una nueva pestaña`
        );


        await popup.waitForLoadState(
            'domcontentloaded'
        ).catch(
            () => {}
        );


        console.log(
            `URL nueva pestaña de ${nombre}:`,
            popup.url()
        );


        await popup.close();


        await page.bringToFront();


        console.log(
            `✔ Nueva pestaña de ${nombre} cerrada`
        );


        console.log(
            `✔ Selección de ${nombre} procesada`
        );


        return true;
    }


    //=====================================================
    // CASO SIN POPUP
    //=====================================================

    console.log(
        `⚠ ${nombre} no abrió una nueva pestaña`
    );


    return false;
}


//=========================================================
// Cerrar sesión
//=========================================================

async function cerrarSesion(
    page: Page
) {

    console.log(
        '================================================='
    );

    console.log(
        'Cerrando sesión...'
    );

    console.log(
        '================================================='
    );


    const cerrarSesionLocator =
        page
            .getByText(
                'Cerrar Sesión',
                {
                    exact: true
                }
            )
            .first();


    await expect(
        cerrarSesionLocator
    ).toBeVisible({
        timeout: 30000
    });


    //=====================================================
    // Cerrar Sesión también puede estar al borde inferior.
    //=====================================================

    await cerrarSesionLocator.scrollIntoViewIfNeeded();


    await expect(
        cerrarSesionLocator
    ).toBeInViewport();


    console.log(
        '✔ Cerrar Sesión desplazado a la vista'
    );


    await cerrarSesionLocator.click();


    await page.waitForURL(
        '**/login/**',
        {
            timeout: 30000
        }
    );


    console.log(
        '✔ Sesión cerrada correctamente'
    );


    console.log(
        'URL después del logout:',
        page.url()
    );
}


//=========================================================
// FLUJO MARTIN
//=========================================================

async function flujoMartin(
    page: Page,
    password: string
) {

    console.log(
        '================================================='
    );

    console.log(
        'FLUJO USUARIO AZUL - MARTIN'
    );

    console.log(
        '================================================='
    );


    await iniciarSesion(
        page,
        DNI_AZUL,
        password
    );


    await ingresarLlamandoAlDoctor(
        page
    );


    await validarPantallaSeleccionIntegrante(
        page
    );


    await validarIntegrante(
        page,
        INTEGRANTE_MARTIN
    );


    const martinSeleccionado =
        await seleccionarIntegrante(
            page,
            INTEGRANTE_MARTIN
        );


    if (!martinSeleccionado) {

        throw new Error(
            'Martin fue seleccionado pero no se abrió la pestaña esperada de Llamando al Doctor'
        );
    }


    console.log(
        '✔ Martin seleccionado correctamente'
    );


    await cerrarSesion(
        page
    );
}

//=========================================================
// FLUJO YUBESMI
//
// ESTE ES EL CAMBIO IMPORTANTE:
//
// Yubesmi es la TITULAR.
//
// Primero:
//     Yubesmi
//
// Después:
//     Ilay
//
//=========================================================

async function flujoYubesmi(
    page: Page,
    password: string
) {

    console.log(
        '================================================='
    );

    console.log(
        'FLUJO USUARIO 95786178 - YUBESMI + ILAY'
    );

    console.log(
        '================================================='
    );


    await iniciarSesion(
        page,
        DNI_SEGUNDO_USUARIO,
        password
    );


    //=====================================================
    // Entrar a Llamando al Doctor.
    //=====================================================

    await ingresarLlamandoAlDoctor(
        page
    );


    //=====================================================
    // Validar pantalla.
    //=====================================================

    await validarPantallaSeleccionIntegrante(
        page
    );


    //=====================================================
    // VALIDAR YUBESMI
    //=====================================================

    await validarIntegrante(
        page,
        INTEGRANTE_YUBESMI
    );


    //=====================================================
    // VALIDAR ILAY
    //=====================================================

    await validarIntegrante(
        page,
        INTEGRANTE_ILAY
    );


    console.log(
        '================================================='
    );

    console.log(
        'PASO 1: Seleccionando titular Yubesmi'
    );

    console.log(
        '================================================='
    );


    const yubesmiSeleccionada =
        await seleccionarIntegrante(
            page,
            INTEGRANTE_YUBESMI
        );


    if (!yubesmiSeleccionada) {

        throw new Error(
            'Yubesmi NO abrió la pestaña esperada. El flujo se detiene antes de seleccionar Ilay.'
        );
    }


    console.log(
        '✔ Yubesmi seleccionada correctamente'
    );

    console.log(
        '✔ Pestaña de Yubesmi cerrada'
    );


    //=====================================================
    // MUY IMPORTANTE
    //
    // Después de cerrar la pestaña de Yubesmi  la página de selección de integrantes.
    // Espera nuevamente la pantalla antes de tocar Ilay.
    //=====================================================

    await expect(
        page.getByText(
            'Seleccioná el integrante por el cual querés hacer la consulta',
            {
                exact: true
            }
        )
    ).toBeVisible({
        timeout: 30000
    });


    //=====================================================
    // PASO 2
    //
    //  seleccionamos ILAY.
    //=====================================================

    console.log(
        '================================================='
    );

    console.log(
        'PASO 2: Seleccionando integrante Ilay'
    );

    console.log(
        '================================================='
    );


    await validarIntegrante(
        page,
        INTEGRANTE_ILAY
    );


    const ilaySeleccionado =
        await seleccionarIntegrante(
            page,
            INTEGRANTE_ILAY
        );


    if (!ilaySeleccionado) {

        throw new Error(
            'Ilay NO abrió la pestaña esperada después de seleccionar Yubesmi.'
        );
    }


    console.log(
        '✔ Ilay seleccionado correctamente'
    );

    console.log(
        '✔ Pestaña de Ilay cerrada'
    );


    //=====================================================
    // Logout
    //=====================================================

    await cerrarSesion(
        page
    );
}


//=========================================================
// TEST
//=========================================================

test(
    'Llamando al Doctor - Martin y Yubesmi',
    async ({ page }) => {

        //=================================================
        // Usuario azul
        //=================================================

        const usuarioAzul =
            obtenerUsuarioAzul();


        console.log(
            '================================================='
        );

        console.log(
            'USUARIO AZUL'
        );

        console.log(
            `DNI: ${usuarioAzul.dni}`
        );

        console.log(
            '================================================='
        );


        //=================================================
        // MARTIN
        //=================================================

        await test.step(
            'Flujo completo Martin',
            async () => {

                await flujoMartin(
                    page,
                    usuarioAzul.password
                );
            }
        );


        //=================================================
        // Segundo usuario
        //=================================================

        const usuario95786178 =
            obtenerSegundoUsuario();


        console.log(
            '================================================='
        );

        console.log(
            'USUARIO 95786178'
        );

        console.log(
            `DNI: ${DNI_SEGUNDO_USUARIO}`
        );

        console.log(
            usuario95786178
                ? 'Usuario encontrado en users'
                : 'Usuario no encontrado en users'
        );

        console.log(
            'Password: se utiliza password del usuario azul'
        );

        console.log(
            '================================================='
        );


        //=================================================
        // YUBESMI + ILAY
        //=================================================

        await test.step(
            'Flujo completo Yubesmi e Ilay',
            async () => {

                await flujoYubesmi(
                    page,
                    usuarioAzul.password
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
            '✔ Usuario 36982434: Martin validado y seleccionado'
        );

        console.log(
            '✔ Usuario 95786178: Yubesmi validada y seleccionada'
        );

        console.log(
            '✔ Usuario 95786178: Ilay validado y seleccionado'
        );

        console.log(
            '✔ Sesiones cerradas correctamente'
        );

        console.log(
            '================================================='
        );
    }
);