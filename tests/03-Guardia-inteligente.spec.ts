import { test } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import { users } from '../data/users'
import { esperarCarga } from '../utils/waits'

test.setTimeout(120000)

test('guardia inteligentes - flujo completo', async ({ page }) => {
  
  // Usuario Azul
  const user = users.find(u => u.tipo === 'azul')
  if (!user) throw new Error('Usuario azul no encontrado')
  const loginPage = new LoginPage(page)
  
  // 1. Ir a la URL de login
  await page.goto('https://portal-test.galeno.com.ar/login/')
  
  // 2. Loguearse con usuario Azul
  await loginPage.login(user.dni, user.password)
  
  // 3. Esperar a que cargue la home
  await page.waitForURL('**/socio/home', { timeout: 60000 })
  
  // 4. Tomar screenshot de la home para verificar
  await page.screenshot({ path: 'home-screenshot.png', fullPage: true })
  
  // 5. Buscar y hacer click en "Guardia Inteligente" usando el rol button y el texto visible
  const guardiaElement = page.getByRole('button', { name: 'Guardia Inteligente' })
  await guardiaElement.waitFor({ state: 'visible', timeout: 60000 })
  await guardiaElement.click()
  
  // 6. Esperar a que cargue la página de guardia inteligente
  await page.waitForURL('**/socio/guardia_inteligente', { timeout: 90000 })
  
  // 7. Verificar que estamos en la página correcta
  await test.expect(page).toHaveURL(/\/socio\/guardia_inteligente/)
  
  // Esperar a que termine la carga de la página
  await esperarCarga(page)
  
  // Tomar screenshot adicional antes de buscar el botón INGRESAR
  await page.screenshot({ path: 'antes-ingresar-screenshot.png', fullPage: true })
  
  // 9. Click en el boton "Ingresar"
  const ingresarButton = page.locator('#btnGIIngresar')
  await ingresarButton.click({ force: true })
  
  // 13. Seleccionar integrante "Yubesmi" de manera más específica
  const integranteOptions = page.locator('div').filter({ hasText: 'Martin' })
  const yubesmiOption = integranteOptions.first()
  await yubesmiOption.waitFor({ state: 'visible', timeout: 90000 })
  
  // Verificar que encontramos el integrante correcto
  const integranteText = await yubesmiOption.textContent()
  console.log(`Seleccionando integrante: ${integranteText}`)
  await test.expect(integranteText).toContain('Martin')
  await yubesmiOption.scrollIntoViewIfNeeded()
  await Promise.all([
    page.waitForURL('**/socio/guardia_inteligente/paso1', { timeout: 90000 }),
    yubesmiOption.click({ force: true })
  ])
  
  // 14. Tomar screenshot final
  await page.screenshot({ path: 'paso1-screenshot.png', fullPage: true })
  
  // 15. Click en el desplegable de especialidades usando el combobox
  const especialidadesCombobox = page.getByRole('combobox', { name: 'Elegí la especialidad' })
  
  // Verificar si ya está expandido, si no, hacer click para expandirlo
  const isExpanded = await especialidadesCombobox.getAttribute('aria-expanded') === 'true'
  if (!isExpanded) await especialidadesCombobox.click()
  
    // Seleccionar "Pediatria" de las opciones
  await page.getByRole('option', { name: 'Pediatria' }).click()
  
  // 16. Hacer click en el botón "CONTINUAR" para ir al paso 2
  const continuarButton1 = page.getByRole('button', { name: 'CONTINUAR' })
  await continuarButton1.waitFor({ state: 'visible', timeout: 90000 })
  await continuarButton1.click()
  
  // 17. Esperar a que cargue el paso 2 (seleccionar centro médico)
  await page.waitForURL('**/socio/guardia_inteligente/paso2', { timeout: 90000 })
  
  // 18. Verificar que estamos en la página correcta
  await test.expect(page).toHaveURL(/\/socio\/guardia_inteligente\/paso2/)
  
  // 19. Tomar screenshot del paso 2
  await page.screenshot({ path: 'paso2-centro-medico-screenshot.png', fullPage: true })
  
  // 20. Seleccionar centro médico "Sanatorio Trinidad Mitre"
  const centroMitre = page.locator('div:has-text("Sanatorio Trinidad Mitre")').first()
  await centroMitre.waitFor({ state: 'visible', timeout: 90000 })
  await centroMitre.click()
  
  // Esperar a que termine la carga después de seleccionar el centro
  await esperarCarga(page)
  
  // 21. Hacer click en CONTINUAR para ir al paso 3 (Confirmación)
  const continuarButton2 = page.getByRole('button', { name: 'CONFIRMAR' }).first()
  await continuarButton2.click({ force: true })
  
  // 22. Esperar a que cargue el paso 3 (confirmación)
  await page.waitForURL('**/socio/guardia_inteligente/paso3', { timeout: 90000 })
  
  // 23. Verificar que estamos en la página correcta
  await test.expect(page).toHaveURL(/\/socio\/guardia_inteligente\/paso3/)
  
  // 24. Tomar screenshot del paso 3
  await page.screenshot({ path: 'paso3-confirmacion-screenshot.png', fullPage: true })
  
  // 25. Hacer click en CONFIRMAR
  const confirmarButton = page.getByRole('button', { name: 'CONFIRMAR' })
  await confirmarButton.waitFor({ state: 'visible', timeout: 90000 })
  await confirmarButton.click()
  
  // 26. Esperar a que cargue la página de guardia inteligente después de confirmar
  await page.waitForURL('**/socio/guardia_inteligente', { timeout: 90000 })
  
  // 27. Verificar que estamos de vuelta en la página de guardia inteligente
  await test.expect(page).toHaveURL(/\/socio\/guardia_inteligente/)
  
  // 28. Tomar screenshot de la guardia confirmada
  await page.screenshot({ path: 'guardia-confirmada-screenshot.png', fullPage: true })
  
  // Definir el locator para la guardia confirmada usando el botón de salida de fila
  const guardiaConfirmada = page.locator('#btnCancelar2').first()
  
  // 36. Click en el boton Salir de la Fila
  await guardiaConfirmada.click()
  
  // 37. Click en SI en el modal de confirmación
  const confirmarSalirButton = page.getByRole('button', { name: 'SI' })
  await confirmarSalirButton.waitFor({ state: 'visible', timeout: 90000 })
  await confirmarSalirButton.click()
  
  // 38. Verificar que aparezca snackbar de "Cancelaste tu lugar en la fila"
  const snackbar = page.getByRole('alert').filter({ hasText: 'Cancelaste tu lugar en la fila' }).first()
  await snackbar.waitFor({ state: 'visible', timeout: 90000 })
  
  // 39. Verificar que estamos en la página correcta y que la guardia ya no se muestra
  await test.expect(page).toHaveURL(/\/socio\/guardia_inteligente/)
  await test.expect(guardiaConfirmada).not.toBeVisible()
  
  // 40. Tomar screenshot final
  await page.screenshot({ path: 'guardia-eliminada.png', fullPage: true })
})