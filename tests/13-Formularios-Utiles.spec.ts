import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { users } from '../data/users';
import { esperarCarga } from '../utils/waits';

test.setTimeout(0);


//=========================================================
// Obtener buscador de formularios
//=========================================================

function obtenerBuscador(page: Page) {

    const buscadorLabel = page.getByLabel('¿Qué formulario necesitás?');

    return buscadorLabel.or(
        page.locator('#\\:rs\\:')
    ).first();

}


//=========================================================
// Función para buscar formularios
//=========================================================

async function buscarFormulario(page: Page, texto: string) {

    console.log(`Escribiendo búsqueda: ${texto}`);

    const buscador = obtenerBuscador(page);

    await expect(buscador).toBeVisible({
        timeout: 30000
    });

    await buscador.fill('');

    await buscador.fill(texto);

    await page.waitForTimeout(1000);

    const formularios = page.locator('.css-n1po2-cardFormularios');

    console.log(`Cantidad de formularios encontrados: ${await formularios.count()}`);

    await expect(formularios.first()).toBeVisible();

}


//=========================================================
// Función para descargar formularios
//=========================================================

async function descargarFormularios(page: Page) {

    const cards = page.locator('.css-n1po2-cardFormularios');

    const cantidad = await cards.count();

    console.log(`Se encontraron ${cantidad} formularios.`);


    for (let i = 0; i < cantidad; i++) {

    console.log(
        `Procesando formulario ${i + 1} de ${cantidad}`
    );
    
        const card = cards.nth(i);

        const nombre = await card.locator('p').textContent();

        console.log(`Descargando: ${nombre}`);


        await card.scrollIntoViewIfNeeded();


        const paginaPrincipal = page;


        const popupPromise = page.waitForEvent('popup').catch(() => null);

        const downloadPromise = page.waitForEvent('download', {
            timeout: 5000
        }).catch(() => null);


        await card.click();


        const popup = await popupPromise;
        const download = await downloadPromise;


        if (download) {

            console.log(
                `✔ Descargado: ${await download.suggestedFilename()}`
            );


        } else if (popup) {


            console.log('✔ PDF abierto en nueva pestaña');


            await popup.waitForLoadState();


            console.log(
                `PDF URL: ${popup.url()}`
            );


            await popup.close();


            // volver a la pantalla principal
            await paginaPrincipal.bringToFront();


        } else {


            console.log('⚠ No se detectó descarga ni popup');

        }


        await paginaPrincipal.waitForTimeout(1000);

    }

}


//=========================================================
// Test
//=========================================================

test('Formularios Útiles - flujo básico', async ({ page }) => {


    const user = users.find(u => u.tipo === 'azul');


    if (!user) throw new Error('Usuario azul no encontrado');


    const loginPage = new LoginPage(page);



    await test.step('Login', async () => {


        await page.goto('https://portal-test.galeno.com.ar/login/');


        await loginPage.login(
            user.dni,
            user.password
        );


        await page.waitForURL('**/socio/home');


    });



    await test.step('Ingresar a Formularios Útiles', async () => {


        const formulariosUtiles = page.getByRole('button', {
            name: 'Formularios Útiles'
        });


        await expect(formulariosUtiles).toBeVisible();


        console.log('URL antes del clic:', page.url());


        await formulariosUtiles.click();


        await page.waitForURL('**/socio/formularios');


        console.log('URL después del clic:', page.url());



        const buscador = obtenerBuscador(page);


        await expect(buscador).toBeVisible({
            timeout: 30000
        });


        console.log('Ingresó correctamente a Formularios Útiles');


        await esperarCarga(page);


    });




    await test.step('Buscar y descargar formularios', async () => {


    console.log('Entró al step Buscar y descargar formularios');


    //=========================================================
    // Filtros principales a validar
    // Se seleccionan textos representativos para evitar
    // búsquedas masivas y aperturas innecesarias de PDF
    //=========================================================

    const categorias = [

        'Discapacidad',
        'Solicitud',
        'Patologías',
        'Consentimiento',
        'Diabetes',
        'VIH',
        'Hepatitis',
        'Drogadependencia',
        'Medicamentos',
        'Prótesis',
        'Reintegros',
        'Fertilidad',
        'Odontología',
        'Trasplantes'
    ];



    const buscador = obtenerBuscador(page);



    for (const categoria of categorias) {


        console.log(`========== ${categoria.toUpperCase()} ==========`);


        console.log('Iniciando búsqueda...');


        await buscarFormulario(page, categoria);


        console.log('Búsqueda realizada.');



        await descargarFormularios(page);


        console.log('Descarga finalizada.');



        await buscador.fill('');



        await esperarCarga(page);


    }

});


});