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

  // .14 Seleccionar "Clinica Medica" en el listado de especialidades
  const clinicaMedicaOption = page.getByRole('option', { name: /Clinica Medica/i }).first()
  await clinicaMedicaOption.waitFor({ state: 'visible', timeout: 15000 })
  await clinicaMedicaOption.click()

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

  // .18 Abrir el desplegable de Centro Médico (usar patrón de test 03)
  const centroMedicoLabel = page.locator('label:has-text("Centro Médico")')
  const centroMedicoComboboxRole = page.getByRole('combobox', { name: 'Centro Médico' })
  const centroMedicoCombobox = (await centroMedicoComboboxRole.count()) > 0
    ? centroMedicoComboboxRole.first()
    : centroMedicoLabel
        .locator(
          'xpath=following::div[@role="combobox" and @aria-haspopup="listbox" and not(@aria-disabled="true")][1]'
        )
        .first()

  await centroMedicoCombobox.waitFor({ state: 'visible', timeout: 60000 })
  const centroExpanded = (await centroMedicoCombobox.getAttribute('aria-expanded')) === 'true'
  if (!centroExpanded) await centroMedicoCombobox.click()

  // .19 Seleccionar sólo "Trinidad Medical Center Mitre" (nombre exacto)
  const exactCenterOption = page.getByRole('option', { name: 'Trinidad Medical Center Mitre' })
  await exactCenterOption.waitFor({ state: 'visible', timeout: 90000 })
  await exactCenterOption.click()

  // 20. Tomar screenshot con Centro Médico seleccionado
  await page.screenshot({ path: 'crear-turno-centro-medico-seleccionado-screenshot.png', fullPage: true })

  // 21. Hacer click en el boton "CONTINUAR" usando su id y esperar la siguiente pantalla
  const continuarButton = page.locator('#btnContinuar')
  await continuarButton.waitFor({ state: 'visible', timeout: 60000 })
  await continuarButton.click()

  

  // Tomar screenshot de la pantalla resultante
  await page.screenshot({ path: 'paso2-seleccion-turno-screenshot.png', fullPage: true })

  
  
  //24. Seleccionar el profesional como botón y hacer click en 'Alves Diego Mariano'
  const profButton = page.getByRole('button', { name: 'Alves Diego Mariano' })
  try {
    await profButton.first().waitFor({ state: 'visible', timeout: 15000 })
    await profButton.first().click()
  } catch (err) {
    // fallback: intentar coincidencia más tolerante (sin coma)
    const profButtonAlt = page.getByRole('button', { name: /Alves\s*,?\s*Diego\s*Mariano/i })
    try {
      await profButtonAlt.first().waitFor({ state: 'visible', timeout: 15000 })
      await profButtonAlt.first().click()
    } catch (err2) {
      await page.screenshot({ path: 'prof-button-selection-debug.png', fullPage: true })
      throw new Error(`No se pudo clicar el botón del profesional Alves Diego Mariano: ${String(err2)}`)
    }
  }

  // 25. Dentro del calendario, seleccionar una fecha disponible y luego un horario
  const calendarXpath = '//*[@id="vertical-tabpanel-0"]/div/div[1]/div/div[1]/div/div[2]'
  const calendar = page.locator(`xpath=${calendarXpath}`)
  await calendar.waitFor({ state: 'visible', timeout: 90000 })

  // Buscar botones de fecha habilitados dentro del calendario
  const availableDates = calendar.locator('button:not([disabled])')
  const datesCount = await availableDates.count()
  if (datesCount === 0) {
    await page.screenshot({ path: 'calendar-no-dates-debug.png', fullPage: true })
    throw new Error('No se encontraron fechas disponibles en el calendario')
  }

  // Clicar la primera fecha disponible con texto
  let dateClicked = false
  for (let i = 0; i < datesCount; i++) {
    const d = availableDates.nth(i)
    const txt = (await d.innerText()).replace(/\s+/g, ' ').trim()
    if (!txt) continue
    try {
      await d.scrollIntoViewIfNeeded()
      await d.click()
      dateClicked = true
      break
    } catch (e) {
      // intentar siguiente
    }
  }
  if (!dateClicked) {
    await page.screenshot({ path: 'calendar-date-click-failed.png', fullPage: true })
    throw new Error('No se pudo clicar ninguna fecha disponible del calendario')
  }

  // Esperar que se muestren los horarios y seleccionar el primer horario disponible
  const timeOptionsXpath = '//*[@id="vertical-tabpanel-0"]//button[contains(normalize-space(.),":") or contains(text(),":") ]'
  const timeOptions = page.locator(`xpath=${timeOptionsXpath}`)
  await timeOptions.first().waitFor({ state: 'visible', timeout: 60000 })
  const timeCount = await timeOptions.count()
  if (timeCount === 0) {
    await page.screenshot({ path: 'calendar-no-times-debug.png', fullPage: true })
    throw new Error('No se encontraron horarios disponibles después de seleccionar la fecha')
  }
  // Click al primer horario visible
  let timeClicked = false
  for (let i = 0; i < timeCount; i++) {
    const t = timeOptions.nth(i)
    const text = (await t.innerText()).trim()
    if (!text) continue
    try {
      await t.scrollIntoViewIfNeeded()
      await t.click()
      timeClicked = true
      break
    } catch (e) {
      // intentar siguiente
    }
  }
  if (!timeClicked) {
    await page.screenshot({ path: 'calendar-time-click-failed.png', fullPage: true })
    throw new Error('No se pudo clicar ningún horario disponible del calendario')
  }

  // Screenshot final del paso
  await page.screenshot({ path: 'crear-turno-fecha-hora-seleccionadas-screenshot.png', fullPage: true })
  
  // 26. Verificar que avanzamos al formulario de datos de contacto
  await page.waitForSelector('text=Necesitamos tus datos para comunicarnos con vos', { timeout: 90000 })
  await expect(page.getByText('Necesitamos tus datos para comunicarnos con vos')).toBeVisible()

  // Verificar inputs: usar XPaths exactos para 'N° Área' y 'N° Celular'
  const nAreaXpath = '//*[@id="component-outlinedN° Área"]'
  const celularXpath = '//*[@id="component-outlinedN° Celular"]'
  const nAreaInput = page.locator(`xpath=${nAreaXpath}`)
  const celularInput = page.locator(`xpath=${celularXpath}`)
  await nAreaInput.waitFor({ state: 'visible', timeout: 15000 })
  await celularInput.waitFor({ state: 'visible', timeout: 15000 })

  // Rellenar datos de contacto
  await nAreaInput.fill('011')
  await celularInput.fill('59263547')
  // Rellenar email
  const emailXpath = '//*[@id="component-outlinedE-mail"]'
  const emailInput = page.locator(`xpath=${emailXpath}`)
  await emailInput.waitFor({ state: 'visible', timeout: 15000 })
  await emailInput.fill('Pruebaautomation@gmail.com')

  // 27. Hacer click en el botón CONTINUAR del formulario de datos
  const continuarFinal = page.locator('#btnContinuar')
  await continuarFinal.waitFor({ state: 'visible', timeout: 15000 })
  await continuarFinal.click()
  await page.waitForLoadState('networkidle', { timeout: 90000 })
  await page.screenshot({ path: 'after-continuar-final.png', fullPage: true })

  // 28. Confirmar el turno: esperar el texto y clicar el botón 'CONFIRMAR'
  await page.waitForSelector('text=Confirmá el turno', { timeout: 90000 })
  await expect(page.getByText('Confirmá el turno')).toBeVisible()

  const confirmarBtn = page.getByRole('button', { name: 'CONFIRMAR' })
  await confirmarBtn.first().waitFor({ state: 'visible', timeout: 15000 })
  await confirmarBtn.first().click()
  await page.waitForLoadState('networkidle', { timeout: 90000 })
  await page.screenshot({ path: 'after-confirmar.png', fullPage: true })

  // 29. Verificar snackbar de confirmación y regreso a la home de turnos
  // Esperar varios indicadores posibles: texto exacto, variantes sin signos, role=alert/status, o navegación a /socio/turno
  const successTexts = [
    '¡Turno confirmado con éxito!',
    'Turno confirmado con éxito',
    'Turno confirmado con exito'
  ]
  let successSeen = false
  // Intentar encontrar cualquiera de los textos (timeout total razonable por intento)
  for (const ttxt of successTexts) {
    try {
      await page.waitForSelector(`text=${ttxt}`, { timeout: 60000 })
      await expect(page.getByText(ttxt)).toBeVisible()
      successSeen = true
      break
    } catch (e) {
      // continuar al siguiente texto
    }
  }

  // Si no se vio el texto, intentar localizar un alert/status role (snackbar suele exponer role=alert/status)
  if (!successSeen) {
    try {
      const alert = page.getByRole('status')
      await alert.first().waitFor({ state: 'visible', timeout: 30000 })
      successSeen = true
    } catch (e) {
      try {
        const alert2 = page.getByRole('alert')
        await alert2.first().waitFor({ state: 'visible', timeout: 30000 })
        successSeen = true
      } catch (err) {
        // no alert found
      }
    }
  }

  // Si aún no se detectó, aceptar navegación a la home de turnos como éxito (SPA puede no mostrar snackbar)
  if (!successSeen) {
    try {
      await page.waitForURL('**/socio/turno', { timeout: 60000 })
      successSeen = true
    } catch (e) {
      // nothing
    }
  }

  if (!successSeen) {
    await page.screenshot({ path: 'turno-confirmacion-no-detectada.png', fullPage: true })
    throw new Error('No se detectó confirmación del turno (snackbar ni navegación)')
  }

  await page.screenshot({ path: 'turno-confirmado-home-screenshot.png', fullPage: true })

  // 30. Volver a la lista de turnos: clicar el turno específico y navegar al detalle
  const turnoXpath = '//*[@id="scrollable-auto-tabpanel-0"]/div/div[1]/div/div/div[4]/div'
  const turnoItem = page.locator(`xpath=${turnoXpath}`)
  await turnoItem.waitFor({ state: 'visible', timeout: 60000 })
  await turnoItem.click()

  // Esperar que se muestre el detalle del turno
  await page.waitForURL('**/socio/turno/detalle/0', { timeout: 90000 })
  await expect(page).toHaveURL(/\/socio\/turno\/detalle\/0/)
  await page.screenshot({ path: 'turno-detalle-screenshot.png', fullPage: true })

  // 31. Clicar en 'Cancelar turno' y confirmar en el diálogo modal
  const btnCancelar = page.locator('#btnCancelarTurno')
  await btnCancelar.waitFor({ state: 'visible', timeout: 15000 })
  await btnCancelar.click()

  // El diálogo de confirmación tiene un botón con el texto 'SI' dentro de un <span>.
  // Intentar varias estrategias: role-based, xpath por span con texto, luego fallbacks a span/button específicos.
  let clickedCancelConfirm = false
  // 1) Intentar role button con nombre 'SI'
  try {
    const siBtnByRole = page.getByRole('button', { name: 'SI' })
    await siBtnByRole.first().waitFor({ state: 'visible', timeout: 20000 })
    await siBtnByRole.first().click()
    clickedCancelConfirm = true
  } catch (e) {
    // 2) Intentar xpath que busque un button que contenga un span con texto 'SI'
    try {
      const siBtnXpath = "//button[.//span[normalize-space(text())='SI']]"
      const siBtnXpathLoc = page.locator(`xpath=${siBtnXpath}`)
      await siBtnXpathLoc.first().waitFor({ state: 'visible', timeout: 20000 })
      await siBtnXpathLoc.first().click()
      clickedCancelConfirm = true
    } catch (e2) {
      // 3) Fallback a las XPaths antiguas (span dentro de button[2], o button[2])
      try {
        const confirmCancelSpanXpath = '/html/body/div[4]/div[3]/div/div/button[2]/span[1]'
        const confirmCancelSpan = page.locator(`xpath=${confirmCancelSpanXpath}`)
        await confirmCancelSpan.waitFor({ state: 'visible', timeout: 30000 })
        await confirmCancelSpan.click()
        clickedCancelConfirm = true
      } catch (e3) {
        try {
          const confirmCancelBtnXpath = '/html/body/div[4]/div[3]/div/div/button[2]'
          const confirmCancelBtn = page.locator(`xpath=${confirmCancelBtnXpath}`)
          await confirmCancelBtn.waitFor({ state: 'visible', timeout: 30000 })
          await confirmCancelBtn.click()
          clickedCancelConfirm = true
        } catch (err) {
          // Evitar llamar a screenshot si la página ya fue cerrada
          try {
            if (!page.isClosed && typeof page.isClosed === 'function' ? !page.isClosed() : true) {
              await page.screenshot({ path: 'confirm-cancel-missing.png', fullPage: true })
            }
          } catch (sErr) {
            // Si falla el screenshot (p.ej. contexto cerrado), continuar y lanzar error descriptivo
          }
          throw new Error('No se pudo clicar el botón de confirmar cancelación (SI)')
        }
      }
    }
  }

  // Esperar que la acción se complete y tomar screenshot
  await page.waitForLoadState('networkidle', { timeout: 90000 })
  await page.screenshot({ path: 'after-cancel-turno.png', fullPage: true })
  
  // 32. Verificar que estamos en la URL exacta de Turnos
  await page.waitForURL('https://portal-test.galeno.com.ar/socio/turno', { timeout: 90000 })
  await expect(page).toHaveURL('https://portal-test.galeno.com.ar/socio/turno')
  await page.screenshot({ path: 'after-return-exact-url.png', fullPage: true })

})