import { test, expect } from '../fixtures/auth'
import { esperarCarga } from '../utils/waits'

test.setTimeout(120000)

test('turnos medicos - flujo basico', async ({ authenticatedPage }) => {
  const page = authenticatedPage

  //.1 Tomar screenshot de la home para verificar
  await page.screenshot({ path: 'home-turnos-screenshot.png', fullPage: true })

  //.2 Buscar y hacer click en "Turnos Médicos" usando el rol button y el texto visible
  const turnosElement = page.getByRole('button', { name: 'Turnos Médicos' })
  await turnosElement.waitFor({ state: 'visible', timeout: 60000 })
  await turnosElement.click()

  //.3 Esperar a que cargue la página de turnos médicos
  await page.waitForURL('**/socio/turno', { timeout: 90000 })

  //.4 Verificar que estamos en la página correcta
  await expect(page).toHaveURL(/\/socio\/turno/)

  //.5 Esperar a que termine la carga de la página
  await esperarCarga(page)

  //.6 Tomar screenshot de la página de turnos
  await page.screenshot({ path: 'turnos-medicos-screenshot.png', fullPage: true })

  // .7 Buscar y hacer click en el botón "Nuevo Turno" (icono +)
  const nuevoTurnoButton = page.locator('[data-testid="AddIcon"]')
  await nuevoTurnoButton.waitFor({ state: 'visible', timeout: 60000 })
  await nuevoTurnoButton.click()

  // .8 Esperar a que cargue la página de crear turno
  await page.waitForURL('**/socio/turno/crear', { timeout: 90000 })

  // .9 Verificar que estamos en la página correcta
  await expect(page).toHaveURL(/\/socio\/turno\/crear/)

  // .10 Esperar a que termine la carga de la página
  await esperarCarga(page)

  // .11 Tomar screenshot de la página de crear turno
  await page.screenshot({ path: 'crear-turno-screenshot.png', fullPage: true })

  // .12 Verificar que el checkbox "Especialidad" esté marcado por defecto
  const checkboxEspecialidadByRole = page.getByRole('checkbox', { name: /especialidad/i })
  const checkboxEspecialidad =
    (await checkboxEspecialidadByRole.count()) > 0
      ? checkboxEspecialidadByRole.first()
      : page
          .locator(
            'input[type="checkbox"][name*="especialidad" i], input[type="checkbox"][id*="especialidad" i], input[type="checkbox"]'
          )
          .first()
  await checkboxEspecialidad.waitFor({ state: 'attached', timeout: 60000 })
  await expect(checkboxEspecialidad).toBeChecked()

  // .13 Click en el desplegable de especialidad usando el combobox de MUI
  const especialidadCombobox = page
    .locator('label:has-text("Especialidad")')
    .locator('xpath=following::div[@role="combobox" and @aria-haspopup="listbox"][1]')

  await especialidadCombobox.waitFor({ state: 'visible', timeout: 60000 })

  // Verificar si ya está expandido, si no, abrir con click y fallback por teclado
  const isExpanded = (await especialidadCombobox.getAttribute('aria-expanded')) === 'true'
  if (!isExpanded) {
    await especialidadCombobox.click({ force: true })
    const expandedAfterClick = (await especialidadCombobox.getAttribute('aria-expanded')) === 'true'
    if (!expandedAfterClick) {
      await especialidadCombobox.focus()
      await page.keyboard.press('ArrowDown')
    }
  }

  await expect(especialidadCombobox).toHaveAttribute('aria-expanded', 'true', { timeout: 15000 })

  // .14 Seleccionar "Dermatologia" en el listado de especialidades
  const dermatologiaOption = page.getByRole('option', { name: /Dermatologia/i }).first()
  await dermatologiaOption.waitFor({ state: 'visible', timeout: 15000 })
  await dermatologiaOption.click()

  // .15 Abrir el desplegable "Práctica Médica"
  const practicaMedicaLabel = page.locator('label:has-text("Práctica Médica")')
  const practicaMedicaLabelFallback = page.locator('label:has-text("Practica Medica")')
  const practicaMedicaCombobox =
    (await practicaMedicaLabel.count()) > 0
      ? practicaMedicaLabel
          .locator(
            'xpath=following::div[@role="combobox" and @aria-haspopup="listbox" and not(@aria-disabled="true")][1]'
          )
          .first()
      : practicaMedicaLabelFallback
          .locator(
            'xpath=following::div[@role="combobox" and @aria-haspopup="listbox" and not(@aria-disabled="true")][1]'
          )
          .first()

  await practicaMedicaCombobox.waitFor({ state: 'visible', timeout: 60000 })
  const practicaExpanded = (await practicaMedicaCombobox.getAttribute('aria-expanded')) === 'true'
  if (!practicaExpanded) {
    await practicaMedicaCombobox.click({ force: true })
    const practicaExpandedAfterClick = (await practicaMedicaCombobox.getAttribute('aria-expanded')) === 'true'
    if (!practicaExpandedAfterClick) {
      await practicaMedicaCombobox.focus()
      await page.keyboard.press('ArrowDown')
    }
  }

  await expect(practicaMedicaCombobox).toHaveAttribute('aria-expanded', 'true', { timeout: 15000 })

  // .16 Seleccionar "Consulta" en el desplegable de Práctica Médica
  const consultaOption = page.getByRole('option', { name: /Consulta/i }).first()
  await consultaOption.waitFor({ state: 'visible', timeout: 15000 })
  await consultaOption.click()

  // .17 Tomar screenshot con Especialidad y Práctica Médica seleccionadas
  await page.screenshot({ path: 'crear-turno-especialidad-practica-seleccionadas-screenshot.png', fullPage: true })

  // .18 Abrir "Centro Medico Trinidad Quilmes" en el desplegable de Centro Médico
  const centroMedicoLabel = page.locator('label:has-text("Centro Médico")')
  const centroMedicoCombobox = centroMedicoLabel
    .locator(
      'xpath=following::div[@role="combobox" and @aria-haspopup="listbox" and not(@aria-disabled="true")][1]'
    )
    .first()
  
  await centroMedicoCombobox.waitFor({ state: 'visible', timeout: 60000 })
  const centroExpanded = (await centroMedicoCombobox.getAttribute('aria-expanded')) === 'true'
  if (!centroExpanded) {
    await centroMedicoCombobox.click({ force: true })
    const centroExpandedAfterClick = (await centroMedicoCombobox.getAttribute('aria-expanded')) === 'true'
    if (!centroExpandedAfterClick) {
      await centroMedicoCombobox.focus()
      await page.keyboard.press('ArrowDown') }

      // .19 Seleccionar "Centro Medico Trinidad Quilmes" en el desplegable de Centro Médico
  const consultaOption = page.getByRole('option', { name: /Centro Medico Trinidad Quilmes/i }).first()
  await consultaOption.waitFor({ state: 'visible', timeout: 15000 })
  await consultaOption.click()

  // 20. Tomar screenshot con Centro Médico seleccionado
  await page.screenshot({ path: 'crear-turno-centro-medico-seleccionado-screenshot.png', fullPage: true })

  // 21. Hacer click en el boton "CONTINUAR"
  const continuarButton = page.getByRole('button', { name: /id="btnContinuar"/i })
  await continuarButton.waitFor({ state: 'visible', timeout: 60000 })
  await continuarButton.click()

  // 22. Esperar a que cargue la página de selección de turno
  await page.waitForURL('**/socio/turno/Crear', { timeout: 90000 })

  // 23. Verificar que estamos en la página correcta
  
})